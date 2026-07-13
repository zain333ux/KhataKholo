"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentRoommate } from "@/lib/auth/session";
import { assertPositiveMoney, rupeesToPaisa } from "@/lib/money";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  actionError,
  actionSuccess,
  assertTextLength,
  getRequiredText,
  type ActionState,
} from "@/lib/validators/forms";
import type { Balance } from "@/types/app";

export async function sendReminderAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const current = await requireCurrentRoommate();
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      throw new Error("Supabase is not configured yet.");
    }

    const toRoommateId = getRequiredText(formData, "toRoommateId", "Roommate");
    const amountPaisa = rupeesToPaisa(getRequiredText(formData, "amount", "Amount"));
    const message = getRequiredText(formData, "message", "Message");
    assertTextLength(message, "Message", 5, 500);

    const amountError = assertPositiveMoney(amountPaisa, "Reminder amount");
    if (amountError) {
      throw new Error(amountError);
    }

    const { data: balanceData, error: balanceError } = await supabase
      .from("balances")
      .select("amount_paisa")
      .eq("group_id", current.group_id)
      .eq("debtor_roommate_id", toRoommateId)
      .eq("creditor_roommate_id", current.id)
      .maybeSingle();

    if (balanceError) {
      throw new Error(balanceError.message);
    }

    const balance = balanceData as Balance | null;

    if (!balance || balance.amount_paisa <= 0) {
      throw new Error("You can only remind roommates who owe you.");
    }

    if (amountPaisa > balance.amount_paisa) {
      throw new Error("Reminder amount must match a pending balance.");
    }

    const { error } = await supabase.from("reminders").insert({
      group_id: current.group_id,
      from_roommate_id: current.id,
      to_roommate_id: toRoommateId,
      amount_paisa: amountPaisa,
      message,
    });

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/history");
    revalidatePath("/khata");
    return actionSuccess("Reminder saved.");
  } catch (error) {
    return actionError(error);
  }
}
