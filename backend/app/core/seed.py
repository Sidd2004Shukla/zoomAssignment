from __future__ import annotations

from datetime import datetime, timedelta, timezone
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.common.enums import MeetingEventType, MeetingStatus, ParticipantRole, ParticipantStatus, UserStatus
from app.core.database import SessionLocal, engine, Base
from app.models import Meeting, MeetingEvent, MeetingParticipant, User


def seed_database(db: Session | None = None) -> None:
    close_db = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        close_db = True

    try:
        now = datetime.now(timezone.utc)

        # 1. Seed or get Default Host User
        host_user = db.scalar(select(User).where(User.id == "user_zoom_default"))
        if not host_user:
            host_user = User(
                id="user_zoom_default",
                auth_provider_user_id="user_zoom_default",
                email="alex.morgan@zoomclone.local",
                name="Alex Morgan",
                status=UserStatus.ACTIVE,
            )
            db.add(host_user)
            db.flush()

        # 2. Seed Secondary Team Members
        user2 = db.scalar(select(User).where(User.id == "user_sarah_connor"))
        if not user2:
            user2 = User(
                id="user_sarah_connor",
                auth_provider_user_id="user_sarah_connor",
                email="sarah.c@zoomclone.local",
                name="Sarah Connor",
                status=UserStatus.ACTIVE,
            )
            db.add(user2)

        user3 = db.scalar(select(User).where(User.id == "user_david_chen"))
        if not user3:
            user3 = User(
                id="user_david_chen",
                auth_provider_user_id="user_david_chen",
                email="david.chen@zoomclone.local",
                name="David Chen",
                status=UserStatus.ACTIVE,
            )
            db.add(user3)
        db.flush()

        # 3. Seed Upcoming Meetings
        upcoming_meetings_data = [
            {
                "id": "meeting_upcoming_1",
                "title": "Q4 Roadmap & AI Integration Review",
                "description": "Quarterly review of product milestones, video infrastructure, and AI features.",
                "meeting_code": "592-814-3072",
                "status": MeetingStatus.SCHEDULED,
                "scheduled_start_at": now + timedelta(days=1, hours=2),
                "scheduled_end_at": now + timedelta(days=1, hours=3),
                "settings": {"duration_minutes": 60},
            },
            {
                "id": "meeting_upcoming_2",
                "title": "Frontend Architecture & UX Polish Sync",
                "description": "Walkthrough of Zoom-like navigation, responsive layouts, and participant moderation.",
                "meeting_code": "381-904-7162",
                "status": MeetingStatus.SCHEDULED,
                "scheduled_start_at": now + timedelta(days=2, hours=4),
                "scheduled_end_at": now + timedelta(days=2, hours=4, minutes=45),
                "settings": {"duration_minutes": 45},
            },
        ]

        for m_data in upcoming_meetings_data:
            existing = db.scalar(select(Meeting).where((Meeting.id == m_data["id"]) | (Meeting.meeting_code == m_data["meeting_code"])))
            if not existing:
                meeting = Meeting(
                    id=m_data["id"],
                    host_user_id=host_user.id,
                    title=m_data["title"],
                    description=m_data["description"],
                    meeting_code=m_data["meeting_code"],
                    status=m_data["status"],
                    scheduled_start_at=m_data["scheduled_start_at"],
                    scheduled_end_at=m_data["scheduled_end_at"],
                    settings=m_data["settings"],
                )
                db.add(meeting)
                db.flush()

                # Add Host participant
                hp = MeetingParticipant(
                    meeting_id=meeting.id,
                    user_id=host_user.id,
                    display_name=host_user.name,
                    role=ParticipantRole.HOST,
                    status=ParticipantStatus.INVITED,
                )
                db.add(hp)

        # 4. Seed Previous Meetings
        previous_meetings_data = [
            {
                "id": "meeting_previous_1",
                "title": "FastAPI & WebRTC Performance Benchmarking",
                "description": "Load testing ZegoCloud kit tokens, latency optimization, and event logging.",
                "meeting_code": "729-415-8930",
                "status": MeetingStatus.ENDED,
                "scheduled_start_at": now - timedelta(days=1, hours=2),
                "scheduled_end_at": now - timedelta(days=1, hours=1),
                "started_at": now - timedelta(days=1, hours=2),
                "ended_at": now - timedelta(days=1, hours=1),
                "settings": {"duration_minutes": 60},
            },
            {
                "id": "meeting_previous_2",
                "title": "Sprint 14 Retrospective",
                "description": "Team sprint retrospective discussing completed deliverables and action items.",
                "meeting_code": "614-839-2051",
                "status": MeetingStatus.ENDED,
                "scheduled_start_at": now - timedelta(days=3, hours=1),
                "scheduled_end_at": now - timedelta(days=3),
                "started_at": now - timedelta(days=3, hours=1),
                "ended_at": now - timedelta(days=3),
                "settings": {"duration_minutes": 60},
            },
        ]

        for m_data in previous_meetings_data:
            existing = db.scalar(select(Meeting).where((Meeting.id == m_data["id"]) | (Meeting.meeting_code == m_data["meeting_code"])))
            if not existing:
                meeting = Meeting(
                    id=m_data["id"],
                    host_user_id=host_user.id,
                    title=m_data["title"],
                    description=m_data["description"],
                    meeting_code=m_data["meeting_code"],
                    status=m_data["status"],
                    scheduled_start_at=m_data["scheduled_start_at"],
                    scheduled_end_at=m_data["scheduled_end_at"],
                    started_at=m_data["started_at"],
                    ended_at=m_data["ended_at"],
                    settings=m_data["settings"],
                )
                db.add(meeting)
                db.flush()

                # Add Participants
                hp = MeetingParticipant(
                    meeting_id=meeting.id,
                    user_id=host_user.id,
                    display_name=host_user.name,
                    role=ParticipantRole.HOST,
                    status=ParticipantStatus.JOINED,
                    joined_at=m_data["started_at"],
                    left_at=m_data["ended_at"],
                )
                p2 = MeetingParticipant(
                    meeting_id=meeting.id,
                    user_id=user2.id if user2 else None,
                    display_name="Sarah Connor",
                    role=ParticipantRole.PARTICIPANT,
                    status=ParticipantStatus.JOINED,
                    joined_at=m_data["started_at"],
                    left_at=m_data["ended_at"],
                )
                db.add_all([hp, p2])

                # Audit Events
                db.add(MeetingEvent(
                    meeting_id=meeting.id,
                    actor_user_id=host_user.id,
                    event_type=MeetingEventType.MEETING_CREATED,
                ))
                db.add(MeetingEvent(
                    meeting_id=meeting.id,
                    actor_user_id=host_user.id,
                    event_type=MeetingEventType.MEETING_STARTED,
                ))
                db.add(MeetingEvent(
                    meeting_id=meeting.id,
                    actor_user_id=host_user.id,
                    event_type=MeetingEventType.MEETING_ENDED,
                ))

        db.commit()
        print("Database successfully seeded with default users and sample meetings.")
    except Exception as exc:
        db.rollback()
        print(f"Database seeding warning: {exc}")
    finally:
        if close_db:
            db.close()


if __name__ == "__main__":
    seed_database()
