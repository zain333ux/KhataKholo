import "server-only";

import { notFound } from "next/navigation";

import { requireCurrentRoommate } from "@/lib/auth/session";
import { getActiveRoommatesForGroup, makeRoommateNameMap } from "@/lib/queries/roommates";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { normalizePagination } from "@/lib/pagination";
import type { Balance, Expense, Payment, Reminder, RoommateListItem } from "@/types/app";

export type KhataItem = {
  balance: Balance;
  otherRoommate: Pick<RoommateListItem, "id" | "name" | "phone">;
  direction: "i_owe" | "owes_me";
  amountPaisa: number;
};

export type PairHistoryEvent = {
  id: string;
  type: "expense" | "payment" | "reminder";
  title: string;
  body: string;
  amountPaisa: number;
  createdAt: string;
};

export type PairHistory = {
  otherRoommate: Pick<RoommateListItem, "id" | "name" | "phone" | "login_id">;
  balance: KhataItem | null;
  events: PairHistoryEvent[];
};

export async function getMyKhata(): Promise<KhataItem[]> {
  const current = await requireCurrentRoommate();
  const supabase = await createServerSupabaseClient();
  const roommates = await getActiveRoommatesForGroup(current.group_id);
  const names = makeRoommateNameMap(roommates);

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("balances")
    .select("id, group_id, roommate_one_id, roommate_two_id, debtor_roommate_id, creditor_roommate_id, amount_paisa, created_at, updated_at")
    .eq("group_id", current.group_id)
    .gt("amount_paisa", 0)
    .or(`debtor_roommate_id.eq.${current.id},creditor_roommate_id.eq.${current.id}`)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Could not load khata: ${error.message}`);
  }

  return ((data ?? []) as Balance[]).map((balance) => {
    const otherRoommateId =
      balance.debtor_roommate_id === current.id ? balance.creditor_roommate_id : balance.debtor_roommate_id;

    return {
      balance,
      otherRoommate: names[otherRoommateId] ?? {
        id: otherRoommateId,
        name: "Roommate",
        phone: null,
      },
      direction: balance.debtor_roommate_id === current.id ? "i_owe" : "owes_me",
      amountPaisa: balance.amount_paisa,
    };
  });
}

export async function getPrivatePairHistory(otherRoommateId: string, page = 1, limit = 20): Promise<PairHistory> {
  ({ page, limit } = normalizePagination(page, limit));
  const current = await requireCurrentRoommate();
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    notFound();
  }

  const roommates = await getActiveRoommatesForGroup(current.group_id);
  const otherRoommate = roommates.find((roommate) => roommate.id === otherRoommateId);

  if (!otherRoommate || otherRoommate.id === current.id) {
    notFound();
  }

  const names = makeRoommateNameMap(roommates);

  const myKhata = await getMyKhata();
  const balance = myKhata.find((item) => item.otherRoommate.id === otherRoommateId) ?? null;

  const fetchLimit = page * limit;

  const paymentsQuery = supabase
    .from("payments")
    .select("id, from_roommate_id, to_roommate_id, amount_paisa, status, created_at")
    .eq("group_id", current.group_id)
    .or(
      `and(from_roommate_id.eq.${current.id},to_roommate_id.eq.${otherRoommateId}),and(from_roommate_id.eq.${otherRoommateId},to_roommate_id.eq.${current.id})`,
    )
    .order("created_at", { ascending: false })
    .limit(fetchLimit);

  const remindersQuery = supabase
    .from("reminders")
    .select("id, from_roommate_id, to_roommate_id, amount_paisa, created_at")
    .eq("group_id", current.group_id)
    .or(
      `and(from_roommate_id.eq.${current.id},to_roommate_id.eq.${otherRoommateId}),and(from_roommate_id.eq.${otherRoommateId},to_roommate_id.eq.${current.id})`,
    )
    .order("created_at", { ascending: false })
    .limit(fetchLimit);

  const expenseMembersQuery = supabase
    .from("expense_members")
    .select("expense_id")
    .eq("roommate_id", current.id)
    .limit(1000);

  const [
    { data: paymentsData, error: paymentsError },
    { data: remindersData, error: remindersError },
    { data: myExpenseMembers, error: expenseMembersError },
  ] = await Promise.all([paymentsQuery, remindersQuery, expenseMembersQuery]);

  const pairQueryError = paymentsError ?? remindersError ?? expenseMembersError;
  if (pairQueryError) {
    throw new Error(`Could not load pair history: ${pairQueryError.message}`);
  }

  const myExpenseIds = (myExpenseMembers ?? []).map((member) => member.expense_id);
  const { data: otherExpenseMembers, error: otherExpenseMembersError } = myExpenseIds.length > 0
    ? await supabase
        .from("expense_members")
        .select("expense_id")
        .eq("roommate_id", otherRoommateId)
        .in("expense_id", myExpenseIds)
        .limit(1000)
    : { data: [], error: null };

  if (otherExpenseMembersError) {
    throw new Error(`Could not load shared expenses: ${otherExpenseMembersError.message}`);
  }

  const sharedExpenseIds = (otherExpenseMembers ?? []).map((member) => member.expense_id);
  const { data: paidExpensesData, error: paidExpensesError } = sharedExpenseIds.length > 0
    ? await supabase
        .from("expenses")
        .select("id, title, amount_paisa, paid_by_roommate_id, created_at")
        .eq("group_id", current.group_id)
        .in("id", sharedExpenseIds)
        .order("created_at", { ascending: false })
        .limit(fetchLimit)
    : { data: [], error: null };

  if (paidExpensesError) {
    throw new Error(`Could not load shared expenses: ${paidExpensesError.message}`);
  }

  const expenseEvents = ((paidExpensesData ?? []) as Expense[]).map((expense) => ({
    id: expense.id,
    type: "expense" as const,
    title: expense.title,
    body: `Paid by ${expense.paid_by_roommate_id === current.id ? "you" : names[expense.paid_by_roommate_id]?.name ?? "Roommate"}`,
    amountPaisa: expense.amount_paisa,
    createdAt: expense.created_at,
  }));

  const paymentEvents = ((paymentsData ?? []) as Payment[]).map((payment) => ({
    id: payment.id,
    type: "payment" as const,
    title: payment.status === "confirmed" ? "Payment confirmed" : payment.status === "disputed" ? "Payment disputed" : "Payment requested",
    body: payment.from_roommate_id === current.id ? `You paid ${otherRoommate.name}` : `${otherRoommate.name} paid you`,
    amountPaisa: payment.amount_paisa,
    createdAt: payment.created_at,
  }));

  const reminderEvents = ((remindersData ?? []) as Reminder[]).map((reminder) => ({
    id: reminder.id,
    type: "reminder" as const,
    title: "Reminder sent",
    body: reminder.from_roommate_id === current.id ? `You reminded ${otherRoommate.name}` : `${otherRoommate.name} reminded you`,
    amountPaisa: reminder.amount_paisa,
    createdAt: reminder.created_at,
  }));

  const sorted = [...expenseEvents, ...paymentEvents, ...reminderEvents].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const startIndex = (page - 1) * limit;

  return {
    otherRoommate,
    balance,
    events: sorted.slice(startIndex, startIndex + limit),
  };
}
