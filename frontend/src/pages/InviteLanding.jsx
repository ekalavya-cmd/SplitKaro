import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import {
  getGroupByInviteToken,
  joinGroupViaInvite,
} from "../services/invite.service";
import { queryKeys } from "../queries/queryKeys";

// View states for the invite landing page state machine
const VIEW = {
  LOADING: "loading",
  PREVIEW: "preview",
  JOINING: "joining",
  ALREADY_MEMBER: "alreadyMember",
  SUCCESS: "success",
  INVALID: "invalid",
  JOIN_FAILED: "joinFailed",
};

export default function InviteLanding() {
  const { token } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, isInitializing } = useAuth();
  const { showToast } = useToast();

  const [view, setView] = useState(VIEW.LOADING);
  // groupData: { id, name, description, memberCount } — from preview fetch
  const [groupData, setGroupData] = useState(null);
  // joinedGroupId: set from groupData.id before join call, used by success/alreadyMember states
  const [joinedGroupId, setJoinedGroupId] = useState(null);
  // joinError: message from the failed join response
  const [joinError, setJoinError] = useState("");

  // On mount: fetch group preview (no auth required)
  useEffect(() => {
    // If we landed here (e.g., from login redirect), the token has been consumed.
    if (sessionStorage.getItem("pendingInviteToken") === token) {
      sessionStorage.removeItem("pendingInviteToken");
    }

    let cancelled = false;
    async function fetchPreview() {
      try {
        const data = await getGroupByInviteToken(token);
        if (!cancelled) {
          setGroupData(data);
          setView(VIEW.PREVIEW);
        }
      } catch {
        if (!cancelled) {
          // 404 → invalid link; anything else → also show invalid (safe degradation)
          setView(VIEW.INVALID);
        }
      }
    }
    fetchPreview();
    return () => {
      cancelled = true;
    };
  }, [token]);

  // Handle "Join Group" click
  const handleJoinClick = async () => {
    if (!isAuthenticated) {
      // Preserve intent and send user through login
      sessionStorage.setItem("pendingInviteToken", token);
      navigate("/login");
      return;
    }
    // Authenticated: attempt join.
    // Capture groupId from the already-loaded preview data — the 409 response
    // does NOT return a group ID, so we must snapshot it here before the request.
    const gid = groupData?.id;
    setJoinedGroupId(gid);
    setView(VIEW.JOINING);
    try {
      await joinGroupViaInvite(token);
      // Await invalidation so Layout.jsx mounts with the fresh groups list already
      // available — prevents the ?group= query param silently falling back to groups[0].
      await queryClient.invalidateQueries({ queryKey: queryKeys.groups.all() });
      setView(VIEW.SUCCESS);
      showToast({
        type: "success",
        message: `You've joined ${groupData?.name}!`,
      });
    } catch (err) {
      const status = err?.status;
      if (status === 409) {
        // Already a member — joinedGroupId is already set from the snapshot above
        setView(VIEW.ALREADY_MEMBER);
      } else {
        setJoinError(err?.message || "Something went wrong. Please try again.");
        setView(VIEW.JOIN_FAILED);
      }
    }
  };

  // "Log in first" link — preserve intent before navigating
  const handleLoginFirstClick = (e) => {
    e.preventDefault();
    sessionStorage.setItem("pendingInviteToken", token);
    navigate("/login");
  };

  // "Go to Group" — navigate to Dashboard with group pre-selected via ?group= param
  const handleGoToGroup = () => {
    if (joinedGroupId) {
      navigate(`/?group=${joinedGroupId}`, { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  };

  // Avatar placeholders — preview gives memberCount but not the full member list.
  // Show up to 4 colored circles with single-letter initials.
  const AVATAR_COLORS = [
    "bg-primary",
    "bg-secondary",
    "bg-[#006874]",
    "bg-[#6750A4]",
  ];
  const avatarCount = Math.min(groupData?.memberCount ?? 0, 4);

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-[#F8F9FA] p-4 sm:p-8">
      {/* Central card */}
      <main className="my-auto flex w-full flex-1 items-center justify-center">
        <div className="relative w-full max-w-105 rounded-xl border border-[#C7C4D8] bg-white p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] transition-all">
          {/* Brand wordmark */}
          <div className="mb-7 flex justify-center">
            <h1 className="text-2xl font-black tracking-tight text-primary">
              SplitKaro
            </h1>
          </div>

          {/* ── STATE 1: Loading ── */}
          {view === VIEW.LOADING && (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="mb-6 h-12 w-12 animate-spin rounded-full border-4 border-primary/15 border-t-primary" />
              <div className="mb-3 h-4 w-36 animate-pulse rounded bg-gray-100" />
              <div className="mb-6 h-6 w-48 animate-pulse rounded bg-gray-100" />
              <p className="text-sm text-on-surface-variant">
                Loading invite details...
              </p>
            </div>
          )}

          {/* ── STATE 2: Valid Invite Preview ── */}
          {view === VIEW.PREVIEW && (
            <div className="text-center">
              <p className="mb-1.5 text-[18px] font-semibold tracking-tight text-[#191C1D]">
                You&apos;re invited to join
              </p>
              <h2 className="mb-3 text-2xl font-bold tracking-tight text-[#191C1D]">
                {groupData?.name}
              </h2>

              {/* Member count chip */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#C7C4D8]/60 bg-[#F8F9FA] px-3.5 py-1.5">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                  group
                </span>
                <span className="text-xs font-medium text-on-surface-variant">
                  {groupData?.memberCount} member
                  {groupData?.memberCount !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Avatar cluster */}
              {avatarCount > 0 && (
                <div className="mb-8 flex items-center justify-center -space-x-2">
                  {Array.from({ length: avatarCount }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white ring-2 ring-white ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
              )}

              {/* CTA — show spinner if auth is still initializing */}
              {isInitializing ? (
                <button
                  disabled
                  className="flex h-11 w-full items-center justify-center rounded bg-primary/50 text-[15px] font-medium text-white shadow-sm"
                >
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                </button>
              ) : (
                <button
                  onClick={handleJoinClick}
                  className="flex h-11 w-full items-center justify-center rounded bg-primary text-[15px] font-medium text-white shadow-sm transition-colors hover:bg-primary/90"
                >
                  Join Group
                </button>
              )}

              <p className="mt-4 text-xs text-on-surface-variant">
                Already have an account?{" "}
                <a
                  href="#"
                  onClick={handleLoginFirstClick}
                  className="font-medium text-primary hover:underline"
                >
                  Log in first
                </a>
              </p>
            </div>
          )}

          {/* ── STATE 3: Invalid Link ── */}
          {view === VIEW.INVALID && (
            <div className="py-2 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#F3F4F6] text-on-surface-variant">
                <span className="material-symbols-outlined text-3xl">
                  link_off
                </span>
              </div>
              <h2 className="mb-2 text-xl font-semibold tracking-tight text-[#191C1D]">
                Invite Link Not Found
              </h2>
              <p className="mb-8 px-2 text-sm leading-relaxed text-on-surface-variant">
                This invite link is invalid or no longer exists. Please ask the
                group member to send you a new one.
              </p>
              <Link
                to="/"
                className="inline-flex items-center justify-center py-2 text-sm font-medium text-primary transition-colors hover:underline"
              >
                Back to Dashboard
              </Link>
            </div>
          )}

          {/* ── STATE 4: Already a Member ── */}
          {view === VIEW.ALREADY_MEMBER && (
            <div className="py-2 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-3xl">info</span>
              </div>
              <h2 className="mb-2 text-xl font-semibold tracking-tight text-[#191C1D]">
                You&apos;re Already In!
              </h2>
              <p className="mb-8 text-sm leading-relaxed text-on-surface-variant">
                You&apos;re already a member of{" "}
                <span className="font-semibold text-[#191C1D]">
                  {groupData?.name}
                </span>
                .
              </p>
              <button
                onClick={handleGoToGroup}
                className="flex h-11 w-full items-center justify-center rounded bg-primary text-[15px] font-medium text-white shadow-sm transition-colors hover:bg-primary/90"
              >
                Go to Group
              </button>
            </div>
          )}

          {/* ── STATE 5: Joining (in-flight) ── */}
          {view === VIEW.JOINING && (
            <div className="text-center">
              <p className="mb-1.5 text-[18px] font-semibold tracking-tight text-[#191C1D]">
                You&apos;re invited to join
              </p>
              <h2 className="mb-3 text-2xl font-bold tracking-tight text-[#191C1D]">
                {groupData?.name}
              </h2>

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#C7C4D8]/60 bg-[#F8F9FA] px-3.5 py-1.5">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                  group
                </span>
                <span className="text-xs font-medium text-on-surface-variant">
                  {groupData?.memberCount} member
                  {groupData?.memberCount !== 1 ? "s" : ""}
                </span>
              </div>

              {avatarCount > 0 && (
                <div className="mb-8 flex items-center justify-center -space-x-2 opacity-75">
                  {Array.from({ length: avatarCount }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white ring-2 ring-white ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
              )}

              <button
                disabled
                className="flex h-11 w-full cursor-wait items-center justify-center gap-2.5 rounded bg-primary/80 text-[15px] font-medium text-white shadow-sm"
              >
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>Joining...</span>
              </button>
            </div>
          )}

          {/* ── STATE 6: Success ── */}
          {view === VIEW.SUCCESS && (
            <div className="py-2 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                <span className="material-symbols-outlined text-3xl font-semibold">
                  check
                </span>
              </div>
              <h2 className="mb-2 text-xl font-semibold tracking-tight text-[#191C1D]">
                Welcome to {groupData?.name}!
              </h2>
              <p className="mb-8 text-sm leading-relaxed text-on-surface-variant">
                You&apos;ve successfully joined the group.
              </p>
              <button
                onClick={handleGoToGroup}
                className="flex h-11 w-full items-center justify-center rounded bg-primary text-[15px] font-medium text-white shadow-sm transition-colors hover:bg-primary/90"
              >
                Go to Group
              </button>
            </div>
          )}

          {/* ── STATE 7: Join Failed ── */}
          {view === VIEW.JOIN_FAILED && (
            <div className="text-center">
              <p className="mb-1.5 text-[18px] font-semibold tracking-tight text-[#191C1D]">
                You&apos;re invited to join
              </p>
              <h2 className="mb-3 text-2xl font-bold tracking-tight text-[#191C1D]">
                {groupData?.name}
              </h2>

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#C7C4D8]/60 bg-[#F8F9FA] px-3.5 py-1.5">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                  group
                </span>
                <span className="text-xs font-medium text-on-surface-variant">
                  {groupData?.memberCount} member
                  {groupData?.memberCount !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Inline error banner */}
              <div className="mb-5 flex w-full items-center gap-2 rounded border border-error/30 bg-error-container px-3 py-2.5 text-left">
                <span className="material-symbols-outlined mt-0.5 shrink-0 text-lg! text-error">
                  error
                </span>
                <div className="text-xs leading-snug text-on-error-container">
                  <span className="font-medium text-error">
                    Unable to join group.{" "}
                  </span>
                  <span>{joinError}</span>
                </div>
              </div>

              {/* Retry CTA */}
              <button
                onClick={handleJoinClick}
                className="flex h-11 w-full items-center justify-center rounded bg-primary text-[15px] font-medium text-white shadow-sm transition-colors hover:bg-primary/90"
              >
                Join Group
              </button>

              <p className="mt-4 text-xs text-on-surface-variant">
                Need assistance?{" "}
                <a
                  href="#"
                  className="font-medium text-primary hover:underline"
                >
                  Contact support
                </a>
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md py-4 text-center">
        <p className="text-xs text-on-surface-variant">
          SplitKaro &copy; 2026 &bull; Modern Group Expense Splitting
        </p>
      </footer>
    </div>
  );
}
