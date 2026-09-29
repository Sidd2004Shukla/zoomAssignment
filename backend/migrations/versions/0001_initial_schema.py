"""initial schema

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-09-29 00:00:00.000000

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("auth_provider_user_id", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=True),
        sa.Column("avatar_url", sa.String(length=1024), nullable=True),
        sa.Column("status", sa.Enum("ACTIVE", "INVITED", "DISABLED", name="userstatus"), nullable=False, server_default=sa.text("'ACTIVE'")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("auth_provider_user_id", name="uq_users_auth_provider_user_id"),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )
    op.create_index("ix_users_auth_provider_user_id", "users", ["auth_provider_user_id"], unique=False)
    op.create_index("ix_users_email", "users", ["email"], unique=False)

    op.create_table(
        "meetings",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("host_user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("meeting_code", sa.String(length=32), nullable=False),
        sa.Column("status", sa.Enum("SCHEDULED", "ACTIVE", "ENDED", "CANCELED", name="meetingstatus"), nullable=False, server_default=sa.text("'SCHEDULED'")),
        sa.Column("scheduled_start_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("scheduled_end_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("max_participants", sa.Integer(), nullable=True),
        sa.Column("settings", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("meeting_code", name="uq_meetings_meeting_code"),
    )
    op.create_index("ix_meetings_host_user_id", "meetings", ["host_user_id"], unique=False)
    op.create_index("ix_meetings_meeting_code", "meetings", ["meeting_code"], unique=False)

    op.create_table(
        "meeting_participants",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("meeting_id", sa.String(length=36), sa.ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("display_name", sa.String(length=255), nullable=True),
        sa.Column("role", sa.Enum("HOST", "CO_HOST", "PARTICIPANT", name="participantrole"), nullable=False, server_default=sa.text("'PARTICIPANT'")),
        sa.Column("status", sa.Enum("INVITED", "JOINED", "LEFT", "REMOVED", name="participantstatus"), nullable=False, server_default=sa.text("'INVITED'")),
        sa.Column("joined_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("left_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_muted", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("is_video_enabled", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        sa.Column("is_removed", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("meeting_id", "user_id", name="uq_meeting_participant_member"),
    )
    op.create_index("ix_meeting_participants_meeting_id", "meeting_participants", ["meeting_id"], unique=False)
    op.create_index("ix_meeting_participants_user_id", "meeting_participants", ["user_id"], unique=False)
    op.create_index("ix_meeting_participants_meeting_id_user_id", "meeting_participants", ["meeting_id", "user_id"], unique=False)

    op.create_table(
        "meeting_invitations",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("meeting_id", sa.String(length=36), sa.ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False),
        sa.Column("inviter_user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("invitee_user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("invitee_email", sa.String(length=255), nullable=True),
        sa.Column("status", sa.Enum("PENDING", "ACCEPTED", "DECLINED", "EXPIRED", "CANCELED", name="invitationstatus"), nullable=False, server_default=sa.text("'PENDING'")),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_meeting_invitations_meeting_id", "meeting_invitations", ["meeting_id"], unique=False)
    op.create_index("ix_meeting_invitations_invitee_user_id", "meeting_invitations", ["invitee_user_id"], unique=False)
    op.create_index("ix_meeting_invitations_invitee_email", "meeting_invitations", ["invitee_email"], unique=False)

    op.create_table(
        "meeting_events",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("meeting_id", sa.String(length=36), sa.ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False),
        sa.Column("actor_user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("target_user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("event_type", sa.Enum("MEETING_CREATED", "MEETING_STARTED", "MEETING_ENDED", "PARTICIPANT_JOINED", "PARTICIPANT_LEFT", "PARTICIPANT_REMOVED", "PARTICIPANT_MUTED", "PARTICIPANT_UNMUTED", "ALL_PARTICIPANTS_MUTED", "HOST_CHANGED", "CO_HOST_ASSIGNED", name="meetingeventtype"), nullable=False),
        sa.Column("metadata", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_meeting_events_meeting_id", "meeting_events", ["meeting_id"], unique=False)
    op.create_index("ix_meeting_events_meeting_id_created_at", "meeting_events", ["meeting_id", "created_at"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_meeting_events_meeting_id_created_at", table_name="meeting_events")
    op.drop_index("ix_meeting_events_meeting_id", table_name="meeting_events")
    op.drop_table("meeting_events")

    op.drop_index("ix_meeting_invitations_invitee_email", table_name="meeting_invitations")
    op.drop_index("ix_meeting_invitations_invitee_user_id", table_name="meeting_invitations")
    op.drop_index("ix_meeting_invitations_meeting_id", table_name="meeting_invitations")
    op.drop_table("meeting_invitations")

    op.drop_index("ix_meeting_participants_meeting_id_user_id", table_name="meeting_participants")
    op.drop_index("ix_meeting_participants_user_id", table_name="meeting_participants")
    op.drop_index("ix_meeting_participants_meeting_id", table_name="meeting_participants")
    op.drop_table("meeting_participants")

    op.drop_index("ix_meetings_meeting_code", table_name="meetings")
    op.drop_index("ix_meetings_host_user_id", table_name="meetings")
    op.drop_table("meetings")

    op.drop_index("ix_users_email", table_name="users")
    op.drop_index("ix_users_auth_provider_user_id", table_name="users")
    op.drop_table("users")