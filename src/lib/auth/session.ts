import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { getSessionTokenHash } from "@/lib/auth/session-token";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CurrentRoommate, Group, Roommate, RoommateSession } from "@/types/app";

type RoommateWithGroup = Roommate & {
  groups: Pick<Group, "id" | "name" | "room_code"> | null;
};

async function getCurrentRoommateUncached(): Promise<CurrentRoommate | null> {
  const tokenHash = await getSessionTokenHash();

  if (!tokenHash) {
    return null;
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data: sessionData, error: sessionError } = await supabase
    .from("roommate_sessions")
    .select("*")
    .eq("token_hash", tokenHash)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (sessionError || !sessionData) {
    if (sessionError) {
      console.error("[auth:session] session query error:", sessionError);
    } else {
      console.warn("[auth:session] session not found or expired in DB.");
    }
    return null;
  }

  const session = sessionData as RoommateSession;

  const { data, error } = await supabase
    .from("roommates")
    .select("*, groups!roommates_group_id_fkey(id, name, room_code)")
    .eq("id", session.roommate_id)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error("[auth:session] roommate query error:", error);
    } else {
      console.warn("[auth:session] active roommate not found for id:", session.roommate_id);
    }
    return null;
  }

  const lastSeenAt = new Date(session.last_seen_at).getTime();
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

  if (!Number.isFinite(lastSeenAt) || lastSeenAt < fiveMinutesAgo) {
    const { error: touchError } = await supabase
      .from("roommate_sessions")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", session.id);

    if (touchError) {
      console.error("[auth:session] could not update session activity:", touchError);
    }
  }

  const roommate = data as unknown as RoommateWithGroup;
  if (!roommate.groups) {
    console.warn("[auth:session] group relation missing for roommate:", roommate.id);
    return null;
  }

  return {
    ...roommate,
    group: roommate.groups,
  };
}

export const getCurrentRoommate = cache(getCurrentRoommateUncached);

export async function requireCurrentRoommate(): Promise<CurrentRoommate> {
  const roommate = await getCurrentRoommate();

  if (!roommate) {
    redirect("/login");
  }

  return roommate;
}

export function requireAdmin(roommate: CurrentRoommate): void {
  if (roommate.role !== "admin") {
    throw new Error("Only room admins can do this.");
  }
}
