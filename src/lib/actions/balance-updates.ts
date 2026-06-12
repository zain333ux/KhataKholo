import type { AppSupabaseClient } from "@/lib/supabase/server";
import type { Balance } from "@/types/app";

function getSortedPair(firstRoommateId: string, secondRoommateId: string): [string, string] {
  return firstRoommateId < secondRoommateId
    ? [firstRoommateId, secondRoommateId]
    : [secondRoommateId, firstRoommateId];
}

export async function applyExpenseBalance({
  supabase,
  groupId,
  payerId,
  debtorId,
  sharePaisa,
}: {
  supabase: AppSupabaseClient;
  groupId: string;
  payerId: string;
  debtorId: string;
  sharePaisa: number;
}) {
  if (sharePaisa <= 0 || payerId === debtorId) {
    return;
  }

  const [roommateOneId, roommateTwoId] = getSortedPair(payerId, debtorId);
  const { data } = await supabase
    .from("balances")
    .select("*")
    .eq("group_id", groupId)
    .eq("roommate_one_id", roommateOneId)
    .eq("roommate_two_id", roommateTwoId)
    .maybeSingle();

  const balance = data as Balance | null;

  if (!balance) {
    const { error } = await supabase.from("balances").insert({
      group_id: groupId,
      roommate_one_id: roommateOneId,
      roommate_two_id: roommateTwoId,
      debtor_roommate_id: debtorId,
      creditor_roommate_id: payerId,
      amount_paisa: sharePaisa,
    });

    if (error) {
      throw new Error(error.message);
    }
    return;
  }

  if (balance.amount_paisa === 0) {
    await updateBalance(supabase, balance.id, debtorId, payerId, sharePaisa);
    return;
  }

  if (balance.debtor_roommate_id === debtorId && balance.creditor_roommate_id === payerId) {
    await updateBalance(supabase, balance.id, debtorId, payerId, balance.amount_paisa + sharePaisa);
    return;
  }

  if (balance.amount_paisa > sharePaisa) {
    await updateBalance(supabase, balance.id, balance.debtor_roommate_id, balance.creditor_roommate_id, balance.amount_paisa - sharePaisa);
    return;
  }

  if (balance.amount_paisa === sharePaisa) {
    await updateBalance(supabase, balance.id, balance.debtor_roommate_id, balance.creditor_roommate_id, 0);
    return;
  }

  await updateBalance(supabase, balance.id, debtorId, payerId, sharePaisa - balance.amount_paisa);
}

export async function applyConfirmedPayment({
  supabase,
  groupId,
  fromRoommateId,
  toRoommateId,
  amountPaisa,
}: {
  supabase: AppSupabaseClient;
  groupId: string;
  fromRoommateId: string;
  toRoommateId: string;
  amountPaisa: number;
}) {
  const { data } = await supabase
    .from("balances")
    .select("*")
    .eq("group_id", groupId)
    .eq("debtor_roommate_id", fromRoommateId)
    .eq("creditor_roommate_id", toRoommateId)
    .maybeSingle();

  const balance = data as Balance | null;
  if (!balance || balance.amount_paisa < amountPaisa) {
    throw new Error("Payment cannot be more than the pending balance.");
  }

  await updateBalance(supabase, balance.id, balance.debtor_roommate_id, balance.creditor_roommate_id, balance.amount_paisa - amountPaisa);
}

async function updateBalance(
  supabase: AppSupabaseClient,
  balanceId: string,
  debtorRoommateId: string,
  creditorRoommateId: string,
  amountPaisa: number,
) {
  const { error } = await supabase
    .from("balances")
    .update({
      debtor_roommate_id: debtorRoommateId,
      creditor_roommate_id: creditorRoommateId,
      amount_paisa: amountPaisa,
    })
    .eq("id", balanceId);

  if (error) {
    throw new Error(error.message);
  }
}

