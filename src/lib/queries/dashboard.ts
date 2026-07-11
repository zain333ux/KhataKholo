import "server-only";

import { requireCurrentRoommate } from "@/lib/auth/session";
import { calculateBalanceTotals } from "@/lib/calculations/balances";
import { getActiveRoommatesForGroup, makeRoommateNameMap } from "@/lib/queries/roommates";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Balance, Dispute, Expense, Payment } from "@/types/app";

type RecentExpense = Pick<Expense, "id" | "title" | "amount_paisa" | "expense_date" | "paid_by_roommate_id"> & {
  paidByName: string;
};

type PendingPayment = Payment & {
  fromName: string;
};

type DashboardDispute = Pick<Dispute, "id" | "reason" | "status" | "created_at">;

export type DashboardData = {
  totalOwePaisa: number;
  totalReceivePaisa: number;
  netPaisa: number;
  recentExpenses: RecentExpense[];
  pendingConfirmations: PendingPayment[];
  disputes: DashboardDispute[];
};

type ExpenseMemberWithExpense = {
  expenses: Expense | null;
};

export async function getDashboardData(): Promise<DashboardData> {
  const current = await requireCurrentRoommate();
  const [supabase, roommates] = await Promise.all([
    createServerSupabaseClient(),
    getActiveRoommatesForGroup(current.group_id),
  ]);

  if (!supabase) {
    return {
      totalOwePaisa: 0,
      totalReceivePaisa: 0,
      netPaisa: 0,
      recentExpenses: [],
      pendingConfirmations: [],
      disputes: [],
    };
  }

  const names = makeRoommateNameMap(roommates);
  const balancesQuery = supabase
    .from("balances")
    .select("id, debtor_roommate_id, creditor_roommate_id, amount_paisa, roommate_one_id, roommate_two_id")
    .eq("group_id", current.group_id)
    .or(`debtor_roommate_id.eq.${current.id},creditor_roommate_id.eq.${current.id}`);
  const memberQuery = supabase
    .from("expense_members")
    .select("expenses(id, title, amount_paisa, expense_date, paid_by_roommate_id)")
    .eq("roommate_id", current.id)
    .order("created_at", { ascending: false })
    .limit(5);
  const paymentsQuery = supabase
    .from("payments")
    .select("id, from_roommate_id, amount_paisa")
    .eq("group_id", current.group_id)
    .eq("to_roommate_id", current.id)
    .eq("status", "pending_confirmation")
    .order("created_at", { ascending: false })
    .limit(5);

  const [
    { data: balancesData },
    { data: memberData },
    { data: paymentsData },
  ] = await Promise.all([balancesQuery, memberQuery, paymentsQuery]);

  const balances = (balancesData ?? []) as Balance[];
  const totals = calculateBalanceTotals(current.id, balances);

  const recentExpenses = ((memberData ?? []) as unknown as ExpenseMemberWithExpense[])
    .map((row) => row.expenses)
    .filter((expense): expense is Expense => Boolean(expense))
    .map((expense) => ({
      id: expense.id,
      title: expense.title,
      amount_paisa: expense.amount_paisa,
      expense_date: expense.expense_date,
      paid_by_roommate_id: expense.paid_by_roommate_id,
      paidByName: names[expense.paid_by_roommate_id]?.name ?? "Roommate",
    }));

  const pendingConfirmations = ((paymentsData ?? []) as Payment[]).map((payment) => ({
    ...payment,
    fromName: names[payment.from_roommate_id]?.name ?? "Roommate",
  }));

  const recentExpenseIds = recentExpenses.map((expense) => expense.id);
  const disputesQuery = supabase
    .from("disputes")
    .select("id, reason, status, created_at")
    .eq("group_id", current.group_id)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: disputesData } = recentExpenseIds.length > 0
    ? await disputesQuery.or(`raised_by_roommate_id.eq.${current.id},expense_id.in.(${recentExpenseIds.join(",")})`)
    : await disputesQuery.eq("raised_by_roommate_id", current.id);

  const disputes = (disputesData ?? []) as DashboardDispute[];

  return {
    ...totals,
    recentExpenses,
    pendingConfirmations,
    disputes,
  };
}
