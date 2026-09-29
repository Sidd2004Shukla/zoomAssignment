from __future__ import annotations

from typing import Any
from sqlalchemy.orm import Session

from app.common.enums import MeetingEventType
from app.models import MeetingEvent


def record_meeting_event(
    db: Session,
    meeting_id: str,
    event_type: MeetingEventType,
    actor_user_id: str | None = None,
    target_user_id: str | None = None,
    metadata: dict[str, Any] | None = None,
) -> MeetingEvent:
    event = MeetingEvent(
        meeting_id=meeting_id,
        event_type=event_type,
        actor_user_id=actor_user_id,
        target_user_id=target_user_id,
        event_metadata=metadata or {},
    )
    db.add(event)
    return event
