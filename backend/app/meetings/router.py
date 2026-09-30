from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user_optional
from app.common.enums import MeetingEventType, MeetingStatus, ParticipantRole, ParticipantStatus
from app.core.config import settings
from app.core.database import get_db
from app.events.service import record_meeting_event
from app.integrations.zegocloud.service import generate_zego_token
from app.models import Meeting, MeetingEvent, MeetingParticipant, User
from app.schemas import (
    APIMessage,
    MeetingCreate,
    MeetingEventRead,
    MeetingJoinRequest,
    MeetingRead,
    MeetingUpdate,
    ParticipantRead,
    ZegoTokenRequest,
    ZegoTokenResponse,
)

router = APIRouter(prefix="/meetings", tags=["meetings"])


def _find_meeting(db: Session, meeting_id: str) -> Meeting:
    raw_id = (meeting_id or "").strip()
    if not raw_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found",
        )

    # 1. Exact match on id
    meeting = db.get(Meeting, raw_id)
    if meeting:
        return meeting

    # 2. Exact match on meeting_code
    meeting = db.scalar(select(Meeting).where(Meeting.meeting_code == raw_id))
    if meeting:
        return meeting

    # 3. Match without hyphens
    cleaned_id = raw_id.replace("-", "").strip()
    if cleaned_id:
        meeting = db.scalar(
            select(Meeting).where(
                (Meeting.meeting_code == cleaned_id)
                | (Meeting.id == cleaned_id)
            )
        )
        if meeting:
            return meeting

    # 4. Prefix match (if user typed partial code / first 6+ characters)
    if len(raw_id) >= 6:
        meeting = db.scalar(
            select(Meeting).where(
                Meeting.meeting_code.startswith(raw_id)
                | Meeting.id.startswith(raw_id)
            )
        )
        if meeting:
            return meeting

    # 5. Check personal meeting by host auth_provider_user_id or id
    host_user = db.scalar(select(User).where((User.auth_provider_user_id == raw_id) | (User.id == raw_id)))
    if host_user:
        personal_meeting = db.scalar(
            select(Meeting).where(
                Meeting.host_user_id == host_user.id,
                Meeting.settings.contains({"personal": True}),
            )
        )
        if personal_meeting:
            return personal_meeting

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Meeting not found",
    )


@router.post("", response_model=MeetingRead, status_code=status.HTTP_201_CREATED)
def create_meeting(
    payload: MeetingCreate,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
) -> Meeting:
    # Resolve host
    host = None
    if isinstance(current_user, User):
        host = current_user
    elif payload.host_user_id:
        host = db.get(User, payload.host_user_id)
        if not host:
            host = db.scalar(select(User).where(User.auth_provider_user_id == payload.host_user_id))

    if not host:
        host_id = payload.host_user_id or str(uuid4())
        host = User(
            auth_provider_user_id=host_id,
            email=f"{host_id}@local.invalid",
        )
        db.add(host)
        db.flush()

    host_name = payload.host_name
    if host_name and not host.name and not host_name.startswith("user_"):
        host.name = host_name
        db.add(host)

    meeting_code = payload.meeting_code or str(uuid4())

    existing = db.scalar(select(Meeting).where(Meeting.meeting_code == meeting_code))
    if existing:
        if payload.settings and payload.settings.get("personal"):
            existing.status = MeetingStatus.ACTIVE
            existing.started_at = datetime.now(timezone.utc)
            existing.ended_at = None
            if payload.title:
                existing.title = payload.title
            
            # Ensure host participant is active
            hp = db.scalar(
                select(MeetingParticipant).where(
                    MeetingParticipant.meeting_id == existing.id,
                    MeetingParticipant.user_id == host.id,
                )
            )
            if hp:
                hp.status = ParticipantStatus.JOINED
                hp.joined_at = datetime.now(timezone.utc)
                if host_name:
                    hp.display_name = host_name
            else:
                hp = MeetingParticipant(
                    meeting_id=existing.id,
                    user_id=host.id,
                    display_name=host_name or host.name or host.auth_provider_user_id,
                    role=ParticipantRole.HOST,
                    status=ParticipantStatus.JOINED,
                    joined_at=datetime.now(timezone.utc),
                )
                db.add(hp)
            db.commit()
            db.refresh(existing)
            return existing
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Meeting code already exists",
        )

    meeting_dict = payload.model_dump()
    meeting_dict.pop("host_name", None)
    meeting_dict["host_user_id"] = host.id
    meeting_dict["meeting_code"] = meeting_code

    meeting = Meeting(**meeting_dict)
    db.add(meeting)
    db.flush()

    host_display_name = host_name or host.name or host.auth_provider_user_id
    host_participant = MeetingParticipant(
        meeting_id=meeting.id,
        user_id=host.id,
        display_name=host_display_name,
        role=ParticipantRole.HOST,
        status=ParticipantStatus.JOINED,
        joined_at=datetime.now(timezone.utc),
    )
    db.add(host_participant)

    record_meeting_event(
        db=db,
        meeting_id=meeting.id,
        event_type=MeetingEventType.MEETING_CREATED,
        actor_user_id=host.id,
    )

    db.commit()
    db.refresh(meeting)
    return meeting


@router.get("", response_model=list[MeetingRead])
def list_meetings(db: Session = Depends(get_db)) -> list[Meeting]:
    return list(db.scalars(select(Meeting).order_by(Meeting.created_at.desc())).all())


@router.get("/{meeting_id}", response_model=MeetingRead)
def get_meeting(meeting_id: str, db: Session = Depends(get_db)) -> Meeting:
    return _find_meeting(db, meeting_id)


@router.patch("/{meeting_id}", response_model=MeetingRead)
def update_meeting(
    meeting_id: str,
    payload: MeetingUpdate,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
) -> Meeting:
    meeting = _find_meeting(db, meeting_id)

    if payload.title is not None:
        meeting.title = payload.title
    if payload.description is not None:
        meeting.description = payload.description
    if payload.status is not None:
        old_status = meeting.status
        meeting.status = payload.status
        if payload.status == MeetingStatus.ACTIVE and old_status != MeetingStatus.ACTIVE:
            meeting.started_at = datetime.now(timezone.utc)
            record_meeting_event(db, meeting.id, MeetingEventType.MEETING_STARTED, actor_user_id=current_user.id if current_user else None)
        elif payload.status in (MeetingStatus.ENDED, MeetingStatus.CANCELED) and old_status != payload.status:
            meeting.ended_at = datetime.now(timezone.utc)
            record_meeting_event(db, meeting.id, MeetingEventType.MEETING_ENDED, actor_user_id=current_user.id if current_user else None)
    if payload.scheduled_start_at is not None:
        meeting.scheduled_start_at = payload.scheduled_start_at
    if payload.scheduled_end_at is not None:
        meeting.scheduled_end_at = payload.scheduled_end_at
    if payload.started_at is not None:
        meeting.started_at = payload.started_at
    if payload.ended_at is not None:
        meeting.ended_at = payload.ended_at
    if payload.max_participants is not None:
        meeting.max_participants = payload.max_participants
    if payload.settings is not None:
        meeting.settings = payload.settings

    db.commit()
    db.refresh(meeting)
    return meeting


@router.delete("/{meeting_id}", response_model=APIMessage)
def delete_meeting(
    meeting_id: str,
    db: Session = Depends(get_db),
) -> APIMessage:
    meeting = _find_meeting(db, meeting_id)
    db.delete(meeting)
    db.commit()
    return APIMessage(message="Meeting deleted successfully")


@router.post("/{meeting_id}/join", response_model=ParticipantRead)
def join_meeting(
    meeting_id: str,
    payload: MeetingJoinRequest | None = None,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
) -> MeetingParticipant:
    meeting = _find_meeting(db, meeting_id)
    now = datetime.now(timezone.utc)

    # Check if user already participant
    participant = None
    if current_user:
        participant = db.scalar(
            select(MeetingParticipant).where(
                MeetingParticipant.meeting_id == meeting.id,
                MeetingParticipant.user_id == current_user.id,
            )
        )

    if participant:
        participant.status = ParticipantStatus.JOINED
        participant.joined_at = now
        participant.is_removed = False
        if payload and payload.display_name and not payload.display_name.startswith("user_"):
            participant.display_name = payload.display_name
        if current_user and payload and payload.display_name and not current_user.name and not payload.display_name.startswith("user_"):
            current_user.name = payload.display_name
            db.add(current_user)
    else:
        role = ParticipantRole.HOST if (current_user and current_user.id == meeting.host_user_id) else ParticipantRole.PARTICIPANT
        display_name = (
            (payload and payload.display_name)
            or (current_user and (current_user.name or current_user.auth_provider_user_id))
            or "Guest"
        )
        if current_user and payload and payload.display_name and not current_user.name and not payload.display_name.startswith("user_"):
            current_user.name = payload.display_name
            db.add(current_user)

        participant = MeetingParticipant(
            meeting_id=meeting.id,
            user_id=current_user.id if current_user else None,
            display_name=display_name,
            role=role,
            status=ParticipantStatus.JOINED,
            joined_at=now,
        )
        db.add(participant)

    record_meeting_event(
        db=db,
        meeting_id=meeting.id,
        event_type=MeetingEventType.PARTICIPANT_JOINED,
        actor_user_id=current_user.id if current_user else None,
        target_user_id=current_user.id if current_user else None,
    )

    db.commit()
    db.refresh(participant)
    return participant


@router.post("/{meeting_id}/leave", response_model=APIMessage)
def leave_meeting(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
) -> APIMessage:
    meeting = _find_meeting(db, meeting_id)
    now = datetime.now(timezone.utc)

    if current_user:
        participant = db.scalar(
            select(MeetingParticipant).where(
                MeetingParticipant.meeting_id == meeting.id,
                MeetingParticipant.user_id == current_user.id,
            )
        )
        if participant:
            participant.status = ParticipantStatus.LEFT
            participant.left_at = now
            record_meeting_event(
                db=db,
                meeting_id=meeting.id,
                event_type=MeetingEventType.PARTICIPANT_LEFT,
                actor_user_id=current_user.id,
                target_user_id=current_user.id,
            )
            db.commit()

    return APIMessage(message="Left meeting successfully")


@router.post("/{meeting_id}/zego-token", response_model=ZegoTokenResponse)
def create_zego_token(
    meeting_id: str,
    payload: ZegoTokenRequest,
    db: Session = Depends(get_db),
) -> ZegoTokenResponse:
    meeting = _find_meeting(db, meeting_id)

    token = generate_zego_token(
        room_id=payload.room_id,
        user_id=payload.user_id,
        user_name=payload.user_name,
        effective_time_in_seconds=3600,
    )

    return ZegoTokenResponse(
        app_id=str(settings.zegocloud_app_id),
        token=token,
        room_id=payload.room_id,
        user_id=payload.user_id,
        user_name=payload.user_name,
    )


@router.get("/{meeting_id}/events", response_model=list[MeetingEventRead])
def get_meeting_events(
    meeting_id: str,
    db: Session = Depends(get_db),
) -> list[MeetingEvent]:
    meeting = _find_meeting(db, meeting_id)
    statement = (
        select(MeetingEvent)
        .where(MeetingEvent.meeting_id == meeting.id)
        .order_by(MeetingEvent.created_at.asc())
    )
    return list(db.scalars(statement).all())

