"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentRoommate } from "@/lib/auth/session";
import { validatePaymentReduction } from "@/lib/calculations/balances";
import { assertPositiveMoney, rupeesToPaisa } from "@/lib/money";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  actionError,
  actionSuccess,
  assertTextLength,
  getRequiredText,
  getText,
  type ActionState,
} from "@/lib/validators/forms";
import type { Balance, Payment } from "@/types/app";

async function getCurrentBalanceAmount(
  debtorRoommateId: string,
  creditorRoommateId: string,
): Promise<number> {
  const current = await requireCurrentRoommate();
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return 0;
  }

  const { data, error } = await supabase
    .from("balances")
    .select("*")
    .eq("group_id", current.group_id)
    .eq("debtor_roommate_id", debtorRoommateId)
    .eq("creditor_roommate_id", creditorRoommateId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return ((data as Balance | null)?.amount_paisa ?? 0);
}

export async function recordPaymentReceivedAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const current = await requireCurrentRoommate();
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      throw new Error("Supabase is not configured yet.");
    }

    const fromRoommateId = getRequiredText(formData, "fromRoommateId", "Paying roommate");
    const amountPaisa = rupeesToPaisa(getRequiredText(formData, "amount", "Amount"));
    const note = getText(formData, "note") || null;
    if (note) {
      assertTextLength(note, "Note", 1, 500);
    }
    const amountError = assertPositiveMoney(amountPaisa);
    if (amountError) {
      throw new Error(amountError);
    }
    const currentBalance = await getCurrentBalanceAmount(fromRoommateId, current.id);
    const validationError = validatePaymentReduction(currentBalance, amountPaisa);

    if (validationError) {
      throw new Error(validationError);
    }

    const { error: rpcError } = await supabase.rpc("record_payment_received_v1", {
      p_group_id: current.group_id,
      p_from_roommate_id: fromRoommateId,
      p_to_roommate_id: current.id,
      p_amount_paisa: amountPaisa,
      p_note: note,
    });

    if (rpcError) {
      throw new Error(rpcError.message);
    }

    revalidatePath("/khata");
    revalidatePath("/home");
    return actionSuccess("Payment recorded.");
  } catch (error) {
    return actionError(error);
  }
}

export async function requestPaymentUpdateAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const current = await requireCurrentRoommate();
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      throw new Error("Supabase is not configured yet.");
    }

    const toRoommateId = getRequiredText(formData, "toRoommateId", "Receiver");
    const amountPaisa = rupeesToPaisa(getRequiredText(formData, "amount", "Amount"));
    const note = getText(formData, "note") || null;
    if (note) {
      assertTextLength(note, "Note", 1, 500);
    }
    const amountError = assertPositiveMoney(amountPaisa);
    if (amountError) {
      throw new Error(amountError);
    }
    const currentBalance = await getCurrentBalanceAmount(current.id, toRoommateId);
    const validationError = validatePaymentReduction(currentBalance, amountPaisa);

    if (validationError) {
      throw new Error(validationError);
    }

    const { error } = await supabase.from("payments").insert({
      group_id: current.group_id,
      from_roommate_id: current.id,
      to_roommate_id: toRoommateId,
      amount_paisa: amountPaisa,
      status: "pending_confirmation",
      initiated_by_roommate_id: current.id,
      note,
    });

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/khata");
    revalidatePath("/home");
    return actionSuccess("Payment request sent for confirmation.");
  } catch (error) {
    return actionError(error);
  }
}

export async function confirmPaymentAction(formData: FormData) {
  const current = await requireCurrentRoommate();
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const paymentId = getRequiredText(formData, "paymentId", "Payment");
  const note = getText(formData, "note") || null;

  const { data: paymentData, error: paymentError } = await supabase
    .from("payments")
    .select("*")
    .eq("id", paymentId)
    .eq("to_roommate_id", current.id)
    .eq("status", "pending_confirmation")
    .single();

  if (paymentError || !paymentData) {
    throw new Error(paymentError?.message ?? "Payment request not found.");
  }

  const payment = paymentData as Payment;
  const currentBalance = await getCurrentBalanceAmount(payment.from_roommate_id, payment.to_roommate_id);
  const validationError = validatePaymentReduction(currentBalance, payment.amount_paisa);

  if (validationError) {
    throw new Error(validationError);
  }

  const { error: rpcError } = await supabase.rpc("confirm_payment_v1", {
    p_payment_id: payment.id,
    p_confirmed_by_roommate_id: current.id,
    p_note: note ?? payment.note,
  });

  if (rpcError) {
    throw new Error(rpcError.message);
  }

  revalidatePath("/payments/confirmations");
  revalidatePath("/khata");
  revalidatePath("/home");
}

export async function disputePaymentAction(formData: FormData) {
  const current = await requireCurrentRoommate();
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const paymentId = getRequiredText(formData, "paymentId", "Payment");
  const note = getText(formData, "note") || "Payment disputed by receiver.";

  const { data: disputed, error } = await supabase
    .from("payments")
    .update({
      status: "disputed",
      disputed_at: new Date().toISOString(),
      note,
    })
    .eq("id", paymentId)
    .eq("to_roommate_id", current.id)
    .eq("status", "pending_confirmation")
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!disputed) {
    throw new Error("Payment request not found or already handled.");
  }

  revalidatePath("/payments/confirmations");
  revalidatePath("/home");
}
