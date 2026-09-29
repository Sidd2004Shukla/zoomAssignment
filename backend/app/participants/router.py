from __future__ import annotations

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user_optional
from app.common.enums import MeetingEventType, ParticipantRole, ParticipantStatus
from app.core.database import get_db
from app.events.service import record_meeting_event
from app.models import Meeting, MeetingParticipant, User
from app.permissions.service import require_meeting_host_or_cohost
from app.schemas import (
    APIMessage,
    ParticipantCreate,
    ParticipantMuteRequest,
    ParticipantRead,
)

router = APIRouter(prefix="/meetings/{meeting_id}/participants", tags=["participants"])


def _find_meeting(db: Session, meeting_id: str) -> Meeting:
    meeting = db.get(Meeting, meeting_id)
    if not meeting:
        meeting = db.scalar(select(Meeting).where(Meeting.meeting_code == meeting_id))
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found",
        )
    return meeting


@router.get("", response_model=list[ParticipantRead])
def list_participants(
    meeting_id: str,
    db: Session = Depends(get_db),
) -> list[MeetingParticipant]:
    meeting = _find_meeting(db, meeting_id)
    statement = (
        select(MeetingParticipant)
        .where(
            MeetingParticipant.meeting_id == meeting.id,
            MeetingParticipant.is_removed.is_(False),
        )
        .order_by(MeetingParticipant.created_at.asc())
    )
    return list(db.scalars(statement).all())


@router.post("", response_model=ParticipantRead, status_code=status.HTTP_201_CREATED)
def add_participant(
    meeting_id: str,
    payload: ParticipantCreate,
    db: Session = Depends(get_db),
) -> MeetingParticipant:
    meeting = _find_meeting(db, meeting_id)

    participant = MeetingParticipant(meeting_id=meeting.id, **payload.model_dump())
    db.add(participant)
    db.commit()
    db.refresh(participant)
    return participant


@router.delete("/{participant_id}", response_model=APIMessage)
def remove_participant(
    meeting_id: str,
    participant_id: str,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
) -> APIMessage:
    meeting = _find_meeting(db, meeting_id)
    if current_user:
        require_meeting_host_or_cohost(db, meeting, current_user)

    participant = db.get(MeetingParticipant, participant_id)
    if not participant or participant.meeting_id != meeting.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participant not found in this meeting",
        )

    participant.is_removed = True
    participant.status = ParticipantStatus.REMOVED
    participant.left_at = datetime.now(timezone.utc)

    record_meeting_event(
        db=db,
        meeting_id=meeting.id,
        event_type=MeetingEventType.PARTICIPANT_REMOVED,
        actor_user_id=current_user.id if current_user else None,
        target_user_id=participant.user_id,
        metadata={"removed_participant_id": participant.id},
    )

    db.commit()
    return APIMessage(message="Participant removed from meeting")


@router.post("/{participant_id}/mute", response_model=ParticipantRead)
def mute_participant(
    meeting_id: str,
    participant_id: str,
    payload: ParticipantMuteRequest,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
) -> MeetingParticipant:
    meeting = _find_meeting(db, meeting_id)
    if current_user:
        require_meeting_host_or_cohost(db, meeting, current_user)

    participant = db.get(MeetingParticipant, participant_id)
    if not participant or participant.meeting_id != meeting.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participant not found in this meeting",
        )

    participant.is_muted = payload.is_muted
    event_type = (
        MeetingEventType.PARTICIPANT_MUTED
        if payload.is_muted
        else MeetingEventType.PARTICIPANT_UNMUTED
    )

    record_meeting_event(
        db=db,
        meeting_id=meeting.id,
        event_type=event_type,
        actor_user_id=current_user.id if current_user else None,
        target_user_id=participant.user_id,
    )

    db.commit()
    db.refresh(participant)
    return participant


@router.post("/mute-all", response_model=APIMessage)
def mute_all_participants(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
) -> APIMessage:
    meeting = _find_meeting(db, meeting_id)
    if current_user:
        require_meeting_host_or_cohost(db, meeting, current_user)

    participants = list(
        db.scalars(
            select(MeetingParticipant).where(
                MeetingParticipant.meeting_id == meeting.id,
                MeetingParticipant.role != ParticipantRole.HOST,
                MeetingParticipant.is_removed.is_(False),
            )
        ).all()
    )

    for p in participants:
        p.is_muted = True

    record_meeting_event(
        db=db,
        meeting_id=meeting.id,
        event_type=MeetingEventType.ALL_PARTICIPANTS_MUTED,
        actor_user_id=current_user.id if current_user else None,
    )

    db.commit()
    return APIMessage(message="All participants muted")
