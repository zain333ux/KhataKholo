import "server-only";

import { notFound } from "next/navigation";

import { requireCurrentRoommate } from "@/lib/auth/session";
import { getActiveRoommatesForGroup, makeRoommateNameMap } from "@/lib/queries/roommates";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Dispute, Expense, ExpenseMember } from "@/types/app";

export type ExpenseMemberDetail = ExpenseMember & {
  roommateName: string;
  isCurrentUser: boolean;
};

export type ExpenseDetail = {
  expense: Expense;
  paidByName: string;
  members: ExpenseMemberDetail[];
  currentUserSharePaisa: number;
  isCurrentUserIncluded: boolean;
  disputes: ExpenseDisputeDetail[];
};

export type ExpenseDisputeDetail = Dispute & {
  raisedByName: string;
};

export async function getExpenseDetail(expenseId: string): Promise<ExpenseDetail> {
  const current = await requireCurrentRoommate();
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    notFound();
  }

  const { data: expenseData, error: expenseError } = await supabase
    .from("expenses")
    .select("*")
    .eq("id", expenseId)
    .single();

  if (expenseError || !expenseData) {
    notFound();
  }

  const expense = expenseData as Expense;
  if (expense.group_id !== current.group_id) {
    notFound();
  }

  const roommates = await getActiveRoommatesForGroup(expense.group_id);
  const names = makeRoommateNameMap(roommates);

  const { data: memberData } = await supabase
    .from("expense_members")
    .select("*")
    .eq("expense_id", expense.id)
    .order("created_at");

  const members = ((memberData ?? []) as ExpenseMember[]).map((member) => ({
    ...member,
    roommateName: names[member.roommate_id]?.name ?? "Roommate",
    isCurrentUser: member.roommate_id === current.id,
  }));

  const currentMember = members.find((member) => member.roommate_id === current.id);

  if (!currentMember && current.role !== "admin") {
    notFound();
  }

  const { data: disputesData } = await supabase
    .from("disputes")
    .select("*")
    .eq("expense_id", expense.id)
    .order("created_at", { ascending: false });

  const disputes = ((disputesData ?? []) as Dispute[]).map((dispute) => ({
    ...dispute,
    raisedByName: names[dispute.raised_by_roommate_id]?.name ?? "Roommate",
  }));

  return {
    expense,
    paidByName: names[expense.paid_by_roommate_id]?.name ?? "Roommate",
    members,
    currentUserSharePaisa: currentMember?.share_paisa ?? 0,
    isCurrentUserIncluded: Boolean(currentMember),
    disputes,
  };
}

export async function getExpensesForCurrentUser(limit = 30): Promise<ExpenseDetail[]> {
  const current = await requireCurrentRoommate();
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data: memberData } = await supabase
    .from("expense_members")
    .select("expense_id")
    .eq("roommate_id", current.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  const ids = (memberData ?? []).map((row) => row.expense_id);

  const details: ExpenseDetail[] = [];
  for (const id of ids) {
    details.push(await getExpenseDetail(id));
  }

  return details;
}
