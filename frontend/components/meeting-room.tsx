"use client";

import { useUser } from "@clerk/nextjs";
import { Copy, LayoutList, Mic, MicOff, PhoneOff, ShieldAlert, UserMinus, Users, VolumeX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { joinMeeting, leaveMeeting, updateMeeting } from "@/lib/api/meetings";
import { getParticipants, muteAllParticipants, muteParticipant, removeParticipant } from "@/lib/api/participants";
import { createZegoToken } from "@/lib/api/zego";
import type { Meeting, Participant } from "@/lib/api/types";
import { cn } from "@/lib/utils";

import { Loader } from "./loader";

type MeetingRoomProps = {
  meeting: Meeting;
};

type CallLayoutType = "Auto" | "Grid" | "Sidebar";

export const MeetingRoom = ({ meeting }: MeetingRoomProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoaded } = useUser();
  const containerRef = useRef<HTMLDivElement>(null);
  const zegoRef = useRef<any>(null);

  const [showParticipants, setShowParticipants] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isRefreshingParticipants, setIsRefreshingParticipants] = useState(false);
  const [layout, setLayout] = useState<CallLayoutType>("Auto");

  const roomId = useMemo(() => meeting.meeting_code || meeting.id, [meeting]);
  const isHost = useMemo(() => {
    if (!user) return false;
    return meeting.host_user_id === user.id || meeting.host_user_id.includes(user.id);
  }, [meeting, user]);

  const refreshParticipants = useCallback(async () => {
    try {
      setIsRefreshingParticipants(true);
      const list = await getParticipants(meeting.id);
      setParticipants(list);
    } catch (err) {
      console.error("Failed to load participants:", err);
    } finally {
      setIsRefreshingParticipants(false);
    }
  }, [meeting.id]);

  useEffect(() => {
    let isMounted = true;

    const initializeRoom = async () => {
      if (!isLoaded || !user || !containerRef.current) return;

      try {
        const participantDisplayName =
          user.fullName ||
          user.firstName ||
          user.username ||
          (isHost ? "Host" : "Participant");

        // Record participant joining in backend
        await joinMeeting(meeting.id, participantDisplayName);
        refreshParticipants();
      } catch (e) {
        console.warn("Backend join recording:", e);
      }

      const participantDisplayName =
        user.fullName ||
        user.firstName ||
        user.username ||
        (isHost ? "Host" : "Participant");

      const [zegoModule, tokenResponse] = await Promise.all([
        import("@zegocloud/zego-uikit-prebuilt"),
        createZegoToken(meeting.id, {
          room_id: roomId,
          user_id: user.id,
          user_name: participantDisplayName,
        }),
      ]);

      if (!isMounted || !containerRef.current) return;

      containerRef.current.innerHTML = "";

      const ZegoUIKitPrebuilt =
        (zegoModule as any).ZegoUIKitPrebuilt ||
        (zegoModule as any).default?.ZegoUIKitPrebuilt ||
        (zegoModule as any).default;

      const kit = ZegoUIKitPrebuilt.create(tokenResponse.token);
      zegoRef.current = kit;

      kit.joinRoom({
        container: containerRef.current,
        sharedLinks: [
          {
            name: "Meeting Link",
            url: typeof window !== "undefined" ? `${window.location.origin}/meeting/${meeting.id}` : "",
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference,
        },
        turnOnMicrophoneWhenJoining: true,
        turnOnCameraWhenJoining: true,
        showMyCameraToggleButton: true,
        showMyMicrophoneToggleButton: true,
        showAudioVideoSettingsButton: true,
        showScreenSharingButton: true,
        showTextChat: true,
        showUserList: false, // Managed authoritatively by custom panel
        showPreJoinView: false,
        maxUsers: meeting.max_participants ?? 50,
        layout: layout,
        onLeaveRoom: async () => {
          try {
            await leaveMeeting(meeting.id);
          } catch {
            // ignore
          }
          router.push("/");
        },
      });
    };

    initializeRoom().catch((error) => {
      console.error("ZEGOCLOUD room initialization failed:", error);
      toast({
        title: "Room connection error",
        description: error instanceof Error ? error.message : "Failed to join room",
        variant: "destructive",
      });
    });

    return () => {
      isMounted = false;
      leaveMeeting(meeting.id).catch(() => {});
      if (zegoRef.current?.destroy) {
        zegoRef.current.destroy();
      }
    };
  }, [isLoaded, user, isHost, meeting.id, meeting.max_participants, roomId, layout, router, toast, refreshParticipants]);

  // Periodic participants refresh
  useEffect(() => {
    if (!showParticipants) return;
    refreshParticipants();
    const interval = setInterval(refreshParticipants, 4000);
    return () => clearInterval(interval);
  }, [showParticipants, refreshParticipants]);

  const handleMuteAll = async () => {
    try {
      await muteAllParticipants(meeting.id);
      toast({ title: "All participants muted" });
      refreshParticipants();
    } catch (err) {
      toast({
        title: "Failed to mute participants",
        description: err instanceof Error ? err.message : "Permission denied",
        variant: "destructive",
      });
    }
  };

  const handleMuteParticipant = async (participantId: string, currentMuted: boolean) => {
    try {
      await muteParticipant(meeting.id, participantId, !currentMuted);
      toast({ title: currentMuted ? "Participant unmuted" : "Participant muted" });
      refreshParticipants();
    } catch (err) {
      toast({
        title: "Action failed",
        description: err instanceof Error ? err.message : "Permission denied",
        variant: "destructive",
      });
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    try {
      await removeParticipant(meeting.id, participantId);
      toast({ title: "Participant removed from meeting" });
      refreshParticipants();
    } catch (err) {
      toast({
        title: "Failed to remove participant",
        description: err instanceof Error ? err.message : "Permission denied",
        variant: "destructive",
      });
    }
  };

  const handleEndCallForEveryone = async () => {
    try {
      await updateMeeting(meeting.id, { status: "ENDED" });
      toast({ title: "Meeting ended for everyone" });
      if (zegoRef.current?.destroy) {
        zegoRef.current.destroy();
      }
      router.push("/");
    } catch (err) {
      toast({
        title: "Failed to end meeting",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    }
  };

  const copyMeetingCode = () => {
    const code = meeting.meeting_code || meeting.id;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    toast({
      title: "Meeting code copied to clipboard",
      description: code,
    });
  };

  if (!isLoaded || !user) {
    return <Loader />;
  }

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-dark-2 text-white">
      {/* Top Meeting Header Bar */}
      <header className="flex h-16 w-full items-center justify-between border-b border-dark-1 bg-dark-1 px-4 lg:px-8">
        <div className="flex items-center gap-3">
          <h1 className="max-w-[200px] truncate text-base font-semibold md:max-w-md md:text-lg">
            {meeting.title || "Meeting"}
          </h1>
          <button
            onClick={copyMeetingCode}
            className="flex items-center gap-1.5 rounded-lg bg-dark-3 px-2.5 py-1 text-xs text-sky-1 hover:text-white transition"
            title={`Click to copy meeting code (${meeting.meeting_code || meeting.id})`}
          >
            <Copy size={13} />
            <span className="hidden sm:inline text-gray-300">Code:</span>
            <span className="font-mono font-semibold text-white">
              {meeting.meeting_code || meeting.id}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Layout Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center gap-1.5 rounded-lg bg-dark-3 px-3 py-1.5 text-xs font-medium hover:bg-[#4C535B]"
              title="Change video layout"
            >
              <LayoutList size={16} />
              <span className="hidden md:inline">Layout: {layout}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
              {(["Auto", "Grid", "Sidebar"] as CallLayoutType[]).map((item) => (
                <DropdownMenuItem
                  key={item}
                  className="cursor-pointer text-xs"
                  onClick={() => setLayout(item)}
                >
                  {item} View
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Participant Roster Toggle */}
          <Button
            size="sm"
            variant="outline"
            className={cn(
              "flex items-center gap-1.5 border-none bg-dark-3 text-xs text-white hover:bg-[#4C535B]",
              showParticipants && "bg-blue-1 text-white"
            )}
            onClick={() => setShowParticipants((prev) => !prev)}
          >
            <Users size={16} />
            <span className="hidden sm:inline">Participants</span>
            {participants.length > 0 && (
              <span className="ml-1 rounded-full bg-dark-1 px-1.5 py-0.2 text-[10px]">
                {participants.length}
              </span>
            )}
          </Button>

          {/* Host End Meeting Button */}
          {isHost ? (
            <Button
              size="sm"
              className="bg-red-600 text-xs font-medium hover:bg-red-700"
              onClick={handleEndCallForEveryone}
            >
              <PhoneOff size={14} className="mr-1" />
              End Meeting
            </Button>
          ) : (
            <Button
              size="sm"
              className="bg-red-600 text-xs font-medium hover:bg-red-700"
              onClick={() => router.push("/")}
            >
              <PhoneOff size={14} className="mr-1" />
              Leave
            </Button>
          )}
        </div>
      </header>

      {/* Main Room Container + Participants Sidebar */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* ZEGOCLOUD Interactive Video Grid Container */}
        <main className="relative size-full flex-1">
          <div ref={containerRef} className="size-full" />
        </main>

        {/* Live Participant Roster Drawer */}
        {showParticipants && (
          <aside className="w-80 border-l border-dark-1 bg-dark-1 p-4 text-white flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-dark-3">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-blue-1" />
                  <h3 className="font-semibold text-sm">Participants ({participants.length})</h3>
                </div>
                {isHost && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-7 text-xs px-2"
                    onClick={handleMuteAll}
                    title="Mute all non-host participants"
                  >
                    <VolumeX size={13} className="mr-1" />
                    Mute All
                  </Button>
                )}
              </div>

              <div className="mt-3 flex flex-col gap-2 max-h-[calc(100vh-170px)] overflow-y-auto">
                {participants.length === 0 ? (
                  <p className="text-xs text-sky-2 py-4 text-center">Loading participants...</p>
                ) : (
                  participants.map((p) => {
                    const isSelf = p.user_id === user.id;
                    const isTargetHost = p.role === "HOST";

                    let displayName = p.display_name?.trim() || "";
                    if (isSelf) {
                      displayName =
                        user.fullName ||
                        user.firstName ||
                        user.username ||
                        displayName ||
                        "You";
                    } else if (
                      !displayName ||
                      displayName.startsWith("user_") ||
                      /^[0-9a-f-]{20,}$/i.test(displayName)
                    ) {
                      displayName = isTargetHost ? "Host" : "Participant";
                    }

                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between rounded-lg bg-dark-3 p-2.5 text-xs"
                      >
                        <div className="flex flex-col truncate pr-2">
                          <span className="font-medium text-white truncate">
                            {displayName} {isSelf && "(You)"}
                          </span>
                          <span className="text-[10px] text-sky-2">
                            {p.role} &bull; {p.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {p.is_muted ? (
                            <span title="Muted">
                              <MicOff size={14} className="text-red-400" />
                            </span>
                          ) : (
                            <span title="Unmuted">
                              <Mic size={14} className="text-emerald-400" />
                            </span>
                          )}

                          {isHost && !isTargetHost && (
                            <DropdownMenu>
                              <DropdownMenuTrigger className="p-1 rounded hover:bg-dark-1 text-sky-1 hover:text-white">
                                <ShieldAlert size={14} />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-dark-2 border-dark-1 text-white text-xs">
                                <DropdownMenuItem
                                  onClick={() => handleMuteParticipant(p.id, p.is_muted)}
                                  className="cursor-pointer"
                                >
                                  {p.is_muted ? "Unmute participant" : "Mute participant"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="border-dark-1" />
                                <DropdownMenuItem
                                  onClick={() => handleRemoveParticipant(p.id)}
                                  className="cursor-pointer text-red-400 hover:text-red-300"
                                >
                                  <UserMinus size={13} className="mr-1.5" />
                                  Remove from meeting
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3 bg-dark-3 border-none hover:bg-[#4C535B] text-xs"
              onClick={() => setShowParticipants(false)}
            >
              Close
            </Button>
          </aside>
        )}
      </div>
    </div>
  );
};
