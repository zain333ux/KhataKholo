"use server";

import { revalidatePath } from "next/cache";

import { hasCredentialAliasCollision, isValidPin, normalizeLoginId, normalizePhone } from "@/lib/auth/credentials";
import { hashPin } from "@/lib/auth/pin";
import { revokeRoommateSessions } from "@/lib/auth/session-token";
import { requireAdmin, requireCurrentRoommate } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  actionError,
  actionSuccess,
  assertTextLength,
  getRequiredText,
  getText,
  type ActionState,
} from "@/lib/validators/forms";
import type { RoommateRole } from "@/types/app";

async function assertCredentialAliasesAvailable({
  groupId,
  loginId,
  phone,
  excludedRoommateId,
}: {
  groupId: string;
  loginId: string;
  phone: string | null;
  excludedRoommateId?: string;
}) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured yet.");

  const { data, error } = await supabase
    .from("roommates")
    .select("id, login_id, phone")
    .eq("group_id", groupId);

  if (error) throw new Error(error.message);
  if (hasCredentialAliasCollision(loginId, phone, data ?? [], excludedRoommateId)) {
    throw new Error("That username or phone conflicts with another roommate's login.");
  }
}

export async function addRoommateAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const current = await requireCurrentRoommate();
    requireAdmin(current);

    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      throw new Error("Supabase is not configured yet.");
    }

    const name = getRequiredText(formData, "name", "Name");
    assertTextLength(name, "Name", 2, 80);
    const loginId = normalizeLoginId(getRequiredText(formData, "loginId", "Username or phone"));
    assertTextLength(loginId, "Username or phone", 2, 80);
    const phone = normalizePhone(getText(formData, "phone"));
    const pin = getRequiredText(formData, "pin", "PIN");
    const role = (getText(formData, "role") || "member") as RoommateRole;

    if (!["admin", "member"].includes(role)) {
      throw new Error("Invalid role.");
    }

    if (!isValidPin(pin)) {
      throw new Error("PIN must be exactly 6 digits.");
    }

    await assertCredentialAliasesAvailable({ groupId: current.group_id, loginId, phone });

    const { error } = await supabase.from("roommates").insert({
      group_id: current.group_id,
      name,
      login_id: loginId,
      phone,
      pin_hash: await hashPin(pin),
      role,
    });

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/roommates");
    return actionSuccess("Roommate added.");
  } catch (error) {
    return actionError(error);
  }
}

export async function updateRoommateAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const current = await requireCurrentRoommate();
    requireAdmin(current);

    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      throw new Error("Supabase is not configured yet.");
    }

    const roommateId = getRequiredText(formData, "roommateId", "Roommate");
    const name = getRequiredText(formData, "name", "Name");
    assertTextLength(name, "Name", 2, 80);
    const phone = normalizePhone(getText(formData, "phone"));
    const role = (getText(formData, "role") || "member") as RoommateRole;

    if (!["admin", "member"].includes(role)) {
      throw new Error("Invalid role.");
    }

    if (roommateId === current.id && role !== "admin") {
      throw new Error("You cannot remove your own admin role.");
    }

    const { data: target, error: targetError } = await supabase
      .from("roommates")
      .select("login_id")
      .eq("id", roommateId)
      .eq("group_id", current.group_id)
      .maybeSingle();
    if (targetError) throw new Error(targetError.message);
    if (!target) throw new Error("Roommate not found.");

    await assertCredentialAliasesAvailable({
      groupId: current.group_id,
      loginId: target.login_id,
      phone,
      excludedRoommateId: roommateId,
    });

    const { data: updated, error } = await supabase
      .from("roommates")
      .update({ name, phone, role })
      .eq("id", roommateId)
      .eq("group_id", current.group_id)
      .select("id")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!updated) {
      throw new Error("Roommate not found.");
    }

    revalidatePath("/admin/roommates");
    return actionSuccess("Roommate updated.");
  } catch (error) {
    return actionError(error);
  }
}

export async function deactivateRoommateAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const current = await requireCurrentRoommate();
    requireAdmin(current);

    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      throw new Error("Supabase is not configured yet.");
    }

    const roommateId = getRequiredText(formData, "roommateId", "Roommate");
    if (roommateId === current.id) {
      throw new Error("You cannot remove yourself.");
    }

    const [balanceResult, paymentResult] = await Promise.all([
    supabase
      .from("balances")
      .select("id")
      .eq("group_id", current.group_id)
      .gt("amount_paisa", 0)
      .or(`debtor_roommate_id.eq.${roommateId},creditor_roommate_id.eq.${roommateId}`)
      .limit(1),
    supabase
      .from("payments")
      .select("id")
      .eq("group_id", current.group_id)
      .eq("status", "pending_confirmation")
      .or(`from_roommate_id.eq.${roommateId},to_roommate_id.eq.${roommateId}`)
      .limit(1),
  ]);

    const dependencyError = balanceResult.error ?? paymentResult.error;
    if (dependencyError) throw new Error(dependencyError.message);
    if ((balanceResult.data?.length ?? 0) > 0 || (paymentResult.data?.length ?? 0) > 0) {
      throw new Error("Settle this roommate's balance and pending payments before deactivating them.");
    }

    const { data: deactivated, error } = await supabase
    .from("roommates")
    .update({ is_active: false })
    .eq("id", roommateId)
    .eq("group_id", current.group_id)
    .select("id")
    .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!deactivated) {
      throw new Error("Roommate not found.");
    }

    await revokeRoommateSessions(roommateId);

    revalidatePath("/admin/roommates");
    return actionSuccess("Roommate removed.");
  } catch (error) {
    return actionError(error);
  }
}

export async function resetRoommatePinAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const current = await requireCurrentRoommate();
    requireAdmin(current);

    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      throw new Error("Supabase is not configured yet.");
    }

    const roommateId = getRequiredText(formData, "roommateId", "Roommate");
    const newPin = getRequiredText(formData, "newPin", "New PIN");

    if (!isValidPin(newPin)) {
      throw new Error("PIN must be exactly 6 digits.");
    }

    const { data: updated, error } = await supabase
      .from("roommates")
      .update({ pin_hash: await hashPin(newPin) })
      .eq("id", roommateId)
      .eq("group_id", current.group_id)
      .select("id")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!updated) {
      throw new Error("Roommate not found.");
    }

    await revokeRoommateSessions(roommateId);

    return actionSuccess("PIN reset.");
  } catch (error) {
    return actionError(error);
  }
}
