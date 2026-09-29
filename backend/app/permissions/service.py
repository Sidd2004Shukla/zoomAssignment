from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.common.enums import ParticipantRole
from app.models import Meeting, MeetingParticipant, User


def require_meeting_host_or_cohost(
    db: Session,
    meeting: Meeting,
    user: User,
) -> MeetingParticipant:
    """
    Checks if the user is the meeting owner/host or an active HOST/CO_HOST participant.
    Raises 403 Forbidden if unauthorized.
    """
    if meeting.host_user_id == user.id:
        # User is the primary meeting creator
        participant = db.scalar(
            select(MeetingParticipant).where(
                MeetingParticipant.meeting_id == meeting.id,
                MeetingParticipant.user_id == user.id,
            )
        )
        return participant

    # Check participant role
    participant = db.scalar(
        select(MeetingParticipant).where(
            MeetingParticipant.meeting_id == meeting.id,
            MeetingParticipant.user_id == user.id,
        )
    )

    if not participant or participant.role not in (ParticipantRole.HOST, ParticipantRole.CO_HOST):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Moderation action requires host or co-host role",
        )

    return participant
