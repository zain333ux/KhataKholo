import "server-only";

import { requireCurrentRoommate } from "@/lib/auth/session";
import { getActiveRoommatesForGroup, makeRoommateNameMap } from "@/lib/queries/roommates";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Dispute, Expense, Payment, Reminder } from "@/types/app";

export type HistoryEvent = {
  id: string;
  type: "expense" | "payment" | "dispute" | "reminder";
  title: string;
  body: string;
  amountPaisa: number | null;
  status?: string;
  href?: string;
  createdAt: string;
};

type ExpenseMemberWithExpense = {
  expenses: Expense | null;
};

export async function getHistoryEvents(): Promise<HistoryEvent[]> {
  const current = await requireCurrentRoommate();
  const supabase = await createServerSupabaseClient();
  const roommates = await getActiveRoommatesForGroup(current.group_id);
  const names = makeRoommateNameMap(roommates);

  if (!supabase) {
    return [];
  }

  const { data: expenseMemberData } = await supabase
    .from("expense_members")
    .select("expenses(*)")
    .eq("roommate_id", current.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const expenseEvents = ((expenseMemberData ?? []) as unknown as ExpenseMemberWithExpense[])
    .map((row) => row.expenses)
    .filter((expense): expense is Expense => Boolean(expense))
    .map((expense) => ({
      id: expense.id,
      type: "expense" as const,
      title: expense.title,
      body: `Paid by ${names[expense.paid_by_roommate_id]?.name ?? "Roommate"} on ${expense.expense_date}`,
      amountPaisa: expense.amount_paisa,
      href: `/expenses/${expense.id}`,
      createdAt: expense.created_at,
    }));

  const { data: paymentData } = await supabase
    .from("payments")
    .select("*")
    .eq("group_id", current.group_id)
    .or(`from_roommate_id.eq.${current.id},to_roommate_id.eq.${current.id}`)
    .order("created_at", { ascending: false })
    .limit(50);

  const paymentEvents = ((paymentData ?? []) as Payment[]).map((payment) => {
    const otherId = payment.from_roommate_id === current.id ? payment.to_roommate_id : payment.from_roommate_id;
    const direction = payment.from_roommate_id === current.id ? "You paid" : "You received from";

    return {
      id: payment.id,
      type: "payment" as const,
      title: "Payment",
      body: `${direction} ${names[otherId]?.name ?? "Roommate"}`,
      amountPaisa: payment.amount_paisa,
      status: payment.status,
      createdAt: payment.created_at,
    };
  });

  const expenseIds = expenseEvents.map((event) => event.id);
  const disputesQuery = supabase
    .from("disputes")
    .select("*")
    .eq("group_id", current.group_id)
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: disputeData } = expenseIds.length > 0
    ? await disputesQuery.or(`raised_by_roommate_id.eq.${current.id},expense_id.in.(${expenseIds.join(",")})`)
    : await disputesQuery.eq("raised_by_roommate_id", current.id);

  const disputeEvents = ((disputeData ?? []) as Dispute[]).map((dispute) => ({
    id: dispute.id,
    type: "dispute" as const,
    title: "Dispute",
    body: `${names[dispute.raised_by_roommate_id]?.name ?? "Roommate"}: ${dispute.reason}`,
    amountPaisa: dispute.suggested_correction_paisa,
    status: dispute.status,
    href: `/expenses/${dispute.expense_id}`,
    createdAt: dispute.created_at,
  }));

  const { data: reminderData } = await supabase
    .from("reminders")
    .select("*")
    .eq("group_id", current.group_id)
    .or(`from_roommate_id.eq.${current.id},to_roommate_id.eq.${current.id}`)
    .order("created_at", { ascending: false })
    .limit(50);

  const reminderEvents = ((reminderData ?? []) as Reminder[]).map((reminder) => {
    const otherId = reminder.from_roommate_id === current.id ? reminder.to_roommate_id : reminder.from_roommate_id;
    const direction = reminder.from_roommate_id === current.id ? "You reminded" : "Reminder from";

    return {
      id: reminder.id,
      type: "reminder" as const,
      title: "Reminder",
      body: `${direction} ${names[otherId]?.name ?? "Roommate"}`,
      amountPaisa: reminder.amount_paisa,
      createdAt: reminder.created_at,
    };
  });

  return [...expenseEvents, ...paymentEvents, ...disputeEvents, ...reminderEvents].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
