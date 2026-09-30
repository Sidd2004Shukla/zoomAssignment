from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.common.enums import (
    MeetingEventType,
    MeetingStatus,
    ParticipantRole,
    ParticipantStatus,
    UserStatus,
)


class APIMessage(BaseModel):
    message: str


class ZegoTokenRequest(BaseModel):
    room_id: str = Field(min_length=1, max_length=128)
    user_id: str = Field(min_length=1, max_length=128)
    user_name: str = Field(min_length=1, max_length=255)


class ZegoTokenResponse(BaseModel):
    app_id: str
    token: str
    room_id: str
    user_id: str
    user_name: str


class UserCreate(BaseModel):
    auth_provider_user_id: str = Field(min_length=1, max_length=255)
    email: EmailStr
    name: str | None = None
    avatar_url: str | None = None
    status: UserStatus = UserStatus.ACTIVE


class UserUpdate(BaseModel):
    name: str | None = None
    avatar_url: str | None = None
    status: UserStatus | None = None


class UserRead(UserCreate):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MeetingCreate(BaseModel):
    host_user_id: str
    host_name: str | None = None
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    meeting_code: str | None = Field(default=None, max_length=128)
    status: MeetingStatus = MeetingStatus.SCHEDULED
    scheduled_start_at: datetime | None = None
    scheduled_end_at: datetime | None = None
    started_at: datetime | None = None
    ended_at: datetime | None = None
    max_participants: int | None = Field(default=None, ge=1)
    settings: dict | None = None


class MeetingUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=255)
    description: str | None = None
    status: MeetingStatus | None = None
    scheduled_start_at: datetime | None = None
    scheduled_end_at: datetime | None = None
    started_at: datetime | None = None
    ended_at: datetime | None = None
    max_participants: int | None = Field(default=None, ge=1)
    settings: dict | None = None


class MeetingRead(BaseModel):
    id: str
    host_user_id: str
    title: str
    description: str | None = None
    meeting_code: str
    status: MeetingStatus
    scheduled_start_at: datetime | None = None
    scheduled_end_at: datetime | None = None
    started_at: datetime | None = None
    ended_at: datetime | None = None
    max_participants: int | None = None
    settings: dict | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ParticipantCreate(BaseModel):
    user_id: str | None = None
    display_name: str | None = None
    role: ParticipantRole = ParticipantRole.PARTICIPANT
    status: ParticipantStatus = ParticipantStatus.INVITED
    is_muted: bool = False
    is_video_enabled: bool = True
    is_removed: bool = False


class ParticipantRead(ParticipantCreate):
    id: str
    meeting_id: str
    joined_at: datetime | None = None
    left_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ParticipantMuteRequest(BaseModel):
    is_muted: bool = True


class MeetingJoinRequest(BaseModel):
    display_name: str | None = None


class MeetingEventRead(BaseModel):
    id: str
    meeting_id: str
    actor_user_id: str | None = None
    target_user_id: str | None = None
    event_type: MeetingEventType
    metadata: dict | None = Field(default=None, alias="event_metadata")
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)