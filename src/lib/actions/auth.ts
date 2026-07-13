"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { isValidPin, loginMatchesRoommate, normalizeLoginId, normalizePhone } from "@/lib/auth/credentials";
import { logLoginDiagnostic } from "@/lib/auth/login-diagnostics";
import { hashPin, verifyPin } from "@/lib/auth/pin";
import { clearRoommateSession, createRoommateSession } from "@/lib/auth/session-token";
import { requireCurrentRoommate } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  actionError,
  actionSuccess,
  assertTextLength,
  type ActionState,
  getRequiredText,
  getText,
} from "@/lib/validators/forms";
import type { Group, Roommate } from "@/types/app";

type LoginLookupResult = {
  groupFound: boolean;
  roommate: Roommate | null;
};

async function findRoommateForLogin(roomCode: string, loginInput: string): Promise<LoginLookupResult> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data: groupData, error: groupError } = await supabase
    .from("groups")
    .select("*")
    .ilike("room_code", roomCode)
    .maybeSingle();

  if (groupError || !groupData) {
    return { groupFound: false, roommate: null };
  }

  const group = groupData as Group;
  const { data: roommatesData, error: roommatesError } = await supabase
    .from("roommates")
    .select("*")
    .eq("group_id", group.id)
    .eq("is_active", true);

  if (roommatesError || !roommatesData) {
    return { groupFound: true, roommate: null };
  }

  const roommate = ((roommatesData ?? []) as Roommate[]).find((roommate) =>
    loginMatchesRoommate(loginInput, roommate.login_id, roommate.phone),
  ) ?? null;

  return { groupFound: true, roommate };
}

export async function createRoomAction(_: ActionState, formData: FormData): Promise<ActionState> {
  let createdGroupId: string | null = null;

  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      throw new Error("Supabase is not configured yet.");
    }

    const roomName = getRequiredText(formData, "roomName", "Room name");
    assertTextLength(roomName, "Room name", 2, 80);
    const rawRoomCode = getRequiredText(formData, "roomCode", "Room code");
    const roomCode = rawRoomCode.toUpperCase().replace(/\s/g, "");

    if (!/^[A-Z0-9]{3,20}$/.test(roomCode)) {
      throw new Error("Room code must contain only letters and numbers (3-20 characters, no special characters or spaces).");
    }

    const name = getRequiredText(formData, "name", "Your name");
    assertTextLength(name, "Your name", 2, 80);
    const loginId = normalizeLoginId(getRequiredText(formData, "loginId", "Username or phone"));
    assertTextLength(loginId, "Username or phone", 2, 80);
    const phone = normalizePhone(getText(formData, "phone"));
    const pin = getRequiredText(formData, "pin", "PIN");

    if (!isValidPin(pin)) {
      throw new Error("PIN must be exactly 6 digits.");
    }

    const pinHash = await hashPin(pin);

    const { data: group, error: groupError } = await supabase
      .from("groups")
      .insert({
        name: roomName,
        room_code: roomCode,
      })
      .select("*")
      .single();

    if (groupError || !group) {
      throw new Error(groupError?.message ?? "Could not create the room.");
    }

    createdGroupId = (group as Group).id;

    const { data: roommate, error: roommateError } = await supabase
      .from("roommates")
      .insert({
        group_id: (group as Group).id,
        name,
        login_id: loginId,
        phone,
        pin_hash: pinHash,
        role: "admin",
      })
      .select("*")
      .single();

    if (roommateError || !roommate) {
      throw new Error(roommateError?.message ?? "Could not create the admin roommate.");
    }

    const { error: groupUpdateError } = await supabase
      .from("groups")
      .update({ created_by_roommate_id: (roommate as Roommate).id })
      .eq("id", (group as Group).id);

    if (groupUpdateError) {
      throw new Error(groupUpdateError.message);
    }

    const session = await createRoommateSession((roommate as Roommate).id);
    if (!session.cookieSet) {
      throw new Error("Could not set login cookie. Please try again.");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/constraint|duplicate key|required|must be/i.test(message)) {
      console.warn("[auth:createRoom] rejected input:", message);
    } else {
      console.error("[auth:createRoom] error details:", error);
    }

    if (createdGroupId) {
      try {
        const cleanupClient = await createServerSupabaseClient();
        const { error: cleanupError } = cleanupClient
          ? await cleanupClient.from("groups").delete().eq("id", createdGroupId)
          : { error: null };

        if (cleanupError) {
          console.error("[auth:createRoom] cleanup failed:", cleanupError);
        }
      } catch (cleanupError) {
        console.error("[auth:createRoom] cleanup failed:", cleanupError);
      }
    }

    return actionError(error);
  }

  redirect("/home");
}

export async function loginAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const rawRoomCode = getRequiredText(formData, "roomCode", "Room code");
    const roomCode = rawRoomCode.toUpperCase().replace(/\s/g, "");

    if (!/^[A-Z0-9]{3,20}$/.test(roomCode)) {
      throw new Error("Room code must contain only letters and numbers (3-20 characters, no special characters or spaces).");
    }

    const loginInput = normalizeLoginId(getRequiredText(formData, "loginId", "Username or phone"));
    const pin = getRequiredText(formData, "pin", "PIN");

    if (!isValidPin(pin)) {
      logLoginDiagnostic("invalid_pin_format", {
        roomFound: false,
        roommateFound: false,
        pinMatched: false,
        sessionCreated: false,
        cookieSet: false,
      });
      throw new Error("PIN must be exactly 6 digits.");
    }

    const { groupFound, roommate } = await findRoommateForLogin(roomCode, loginInput);
    logLoginDiagnostic("lookup", {
      roomFound: groupFound,
      roommateFound: Boolean(roommate),
    });

    if (!roommate) {
      logLoginDiagnostic("failed", {
        roomFound: groupFound,
        roommateFound: false,
        pinMatched: false,
        sessionCreated: false,
        cookieSet: false,
        errorCode: "bad_credentials",
      });
      throw new Error("Room code, login, or PIN is incorrect.");
    }

    const pinMatches = await verifyPin(pin, roommate.pin_hash);
    logLoginDiagnostic("pin_check", {
      roomFound: groupFound,
      roommateFound: true,
      pinMatched: pinMatches,
    });

    if (!pinMatches) {
      logLoginDiagnostic("failed", {
        roomFound: groupFound,
        roommateFound: true,
        pinMatched: false,
        sessionCreated: false,
        cookieSet: false,
        errorCode: "bad_credentials",
      });
      throw new Error("Room code, login, or PIN is incorrect.");
    }

    const session = await createRoommateSession(roommate.id);
    if (!session.cookieSet) {
      logLoginDiagnostic("failed", {
        roomFound: true,
        roommateFound: true,
        pinMatched: true,
        sessionCreated: session.sessionCreated,
        cookieSet: false,
        errorCode: "cookie_not_set",
      });
      throw new Error("Could not set login cookie. Please try again.");
    }

    logLoginDiagnostic("success", {
      roomFound: true,
      roommateFound: true,
      pinMatched: true,
      sessionCreated: session.sessionCreated,
      cookieSet: session.cookieSet,
      redirectTarget: "/home",
    });
  } catch (error) {
    logLoginDiagnostic("error", {
      sessionCreated: false,
      cookieSet: false,
      errorCode: error instanceof Error ? error.message : "unknown",
    });
    return actionError(error);
  }

  return actionSuccess("Login successful. Redirecting...");
}

export async function logoutAction() {
  await clearRoommateSession();
  redirect("/login");
}

export async function changePinAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const current = await requireCurrentRoommate();
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      throw new Error("Supabase is not configured yet.");
    }

    const oldPin = getRequiredText(formData, "oldPin", "Current PIN");
    const newPin = getRequiredText(formData, "newPin", "New PIN");

    if (!isValidPin(oldPin) || !isValidPin(newPin)) {
      throw new Error("PIN must be exactly 6 digits.");
    }

    const oldPinMatches = await verifyPin(oldPin, current.pin_hash);
    if (!oldPinMatches) {
      throw new Error("Current PIN is incorrect.");
    }

    const { error } = await supabase
      .from("roommates")
      .update({ pin_hash: await hashPin(newPin) })
      .eq("id", current.id)
      .eq("group_id", current.group_id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/profile");
    return actionSuccess("PIN changed.");
  } catch (error) {
    return actionError(error);
  }
}
