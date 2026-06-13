"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCurrentRoommate } from "@/lib/auth/session";
import { calculateEqualShares, validateCustomShares, type SplitShare } from "@/lib/calculations/splits";
import { rupeesToPaisa } from "@/lib/money";
import { getActiveRoommatesForGroup } from "@/lib/queries/roommates";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  actionError,
  actionSuccess,
  getAllText,
  getRequiredText,
  getText,
  type ActionState,
} from "@/lib/validators/forms";
import type { Expense, SplitType } from "@/types/app";

export async function createExpenseAction(_: ActionState, formData: FormData): Promise<ActionState> {
  let createdExpenseId = "";

  try {
    const current = await requireCurrentRoommate();
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      throw new Error("Supabase is not configured yet.");
    }

    const roommates = await getActiveRoommatesForGroup(current.group_id);
    const roommateIds = new Set(roommates.map((roommate) => roommate.id));

    const title = getRequiredText(formData, "title", "Title");
    const amountPaisa = rupeesToPaisa(getRequiredText(formData, "amount", "Amount"));
    const paidByRoommateId = getRequiredText(formData, "paidByRoommateId", "Paid by");
    const selectedRoommateIds = getAllText(formData, "memberIds");
    const splitType = getRequiredText(formData, "splitType", "Split type") as SplitType;
    const expenseDate = getText(formData, "expenseDate") || new Date().toISOString().slice(0, 10);
    const note = getText(formData, "note") || null;
    const receiptUrl = getText(formData, "receiptUrl") || null;
    const receiptPublicId = getText(formData, "receiptPublicId") || null;

    if (!Number.isInteger(amountPaisa) || amountPaisa <= 0) {
      throw new Error("Amount must be greater than zero.");
    }

    if (!["equal", "custom"].includes(splitType)) {
      throw new Error("Choose a valid split type.");
    }

    if (!roommateIds.has(paidByRoommateId)) {
      throw new Error("Payer must be an active roommate in this room.");
    }

    if (selectedRoommateIds.length === 0) {
      throw new Error("Select at least one included roommate.");
    }

    const invalidSelected = selectedRoommateIds.find((roommateId) => !roommateIds.has(roommateId));
    if (invalidSelected) {
      throw new Error("All selected roommates must belong to this room.");
    }

    const shares: SplitShare[] =
      splitType === "equal"
        ? calculateEqualShares(amountPaisa, selectedRoommateIds)
        : selectedRoommateIds.map((roommateId) => ({
            roommateId,
            sharePaisa: rupeesToPaisa(formData.get(`share_${roommateId}`)),
          }));

    if (splitType === "custom") {
      const customError = validateCustomShares(amountPaisa, shares);
      if (customError) {
        throw new Error(customError);
      }
    }

    const { data: rpcExpenseId, error: rpcError } = await (supabase as any).rpc("create_expense_v1", {
      p_group_id: current.group_id,
      p_title: title,
      p_amount_paisa: amountPaisa,
      p_paid_by_roommate_id: paidByRoommateId,
      p_created_by_roommate_id: current.id,
      p_split_type: splitType,
      p_expense_date: expenseDate,
      p_note: note,
      p_receipt_url: receiptUrl,
      p_receipt_public_id: receiptPublicId,
      p_shares: shares.map((s) => ({ roommate_id: s.roommateId, share_paisa: s.sharePaisa })),
    });

    if (rpcError || !rpcExpenseId) {
      throw new Error(rpcError?.message ?? "Could not add expense.");
    }

    createdExpenseId = rpcExpenseId as string;

    revalidatePath("/home");
    revalidatePath("/khata");
    revalidatePath("/history");
  } catch (error) {
    return actionError(error);
  }

  redirect(`/expenses/${createdExpenseId}`);
}

export async function raiseDisputeAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const current = await requireCurrentRoommate();
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      throw new Error("Supabase is not configured yet.");
    }

    const expenseId = getRequiredText(formData, "expenseId", "Expense");
    const reason = getRequiredText(formData, "reason", "Reason");
    const extraNote = getText(formData, "extraNote");
    const correctionText = getText(formData, "suggestedCorrection");
    const suggestedCorrectionPaisa = correctionText ? rupeesToPaisa(correctionText) : null;

    if (suggestedCorrectionPaisa !== null && (!Number.isInteger(suggestedCorrectionPaisa) || suggestedCorrectionPaisa < 0)) {
      throw new Error("Suggested correction must be a valid amount.");
    }

    const { data: expenseData, error: expenseError } = await supabase
      .from("expenses")
      .select("id, group_id")
      .eq("id", expenseId)
      .single();

    if (expenseError || !expenseData) {
      throw new Error("Expense not found.");
    }

    const expense = expenseData as Pick<Expense, "id" | "group_id">;

    if (expense.group_id !== current.group_id) {
      throw new Error("Expense not found.");
    }

    const { data: memberData } = await supabase
      .from("expense_members")
      .select("id")
      .eq("expense_id", expense.id)
      .eq("roommate_id", current.id)
      .maybeSingle();

    if (!memberData) {
      throw new Error("Only included roommates can raise a dispute.");
    }

    const { error } = await supabase.from("disputes").insert({
      expense_id: expense.id,
      group_id: expense.group_id,
      raised_by_roommate_id: current.id,
      reason: extraNote ? `${reason} ${extraNote}` : reason,
      suggested_correction_paisa: suggestedCorrectionPaisa,
      status: "pending",
    });

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(`/expenses/${expense.id}`);
    revalidatePath("/home");
    return actionSuccess("Dispute raised.");
  } catch (error) {
    return actionError(error);
  }
}
