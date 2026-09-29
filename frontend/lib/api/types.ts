export type UserStatus = "ACTIVE" | "INVITED" | "DISABLED";
export type MeetingStatus = "SCHEDULED" | "ACTIVE" | "ENDED" | "CANCELED";
export type ParticipantRole = "HOST" | "CO_HOST" | "PARTICIPANT";
export type ParticipantStatus = "INVITED" | "JOINED" | "LEFT" | "REMOVED";
export type MeetingEventType =
  | "MEETING_CREATED"
  | "MEETING_STARTED"
  | "MEETING_ENDED"
  | "PARTICIPANT_JOINED"
  | "PARTICIPANT_LEFT"
  | "PARTICIPANT_REMOVED"
  | "PARTICIPANT_MUTED"
  | "PARTICIPANT_UNMUTED"
  | "ALL_PARTICIPANTS_MUTED"
  | "HOST_CHANGED"
  | "CO_HOST_ASSIGNED";

export type User = {
  id: string;
  auth_provider_user_id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  status: UserStatus;
  created_at: string;
  updated_at: string;
};

export type Meeting = {
  id: string;
  host_user_id: string;
  title: string;
  description: string | null;
  meeting_code: string;
  status: MeetingStatus;
  scheduled_start_at: string | null;
  scheduled_end_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  max_participants: number | null;
  settings: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type Participant = {
  id: string;
  meeting_id: string;
  user_id: string | null;
  display_name: string | null;
  role: ParticipantRole;
  status: ParticipantStatus;
  joined_at: string | null;
  left_at: string | null;
  is_muted: boolean;
  is_video_enabled: boolean;
  is_removed: boolean;
  created_at: string;
  updated_at: string;
};

export type MeetingEvent = {
  id: string;
  meeting_id: string;
  actor_user_id: string | null;
  target_user_id: string | null;
  event_type: MeetingEventType;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};