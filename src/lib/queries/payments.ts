import "server-only";

import { requireCurrentRoommate } from "@/lib/auth/session";
import { getActiveRoommatesForGroup, makeRoommateNameMap } from "@/lib/queries/roommates";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Payment } from "@/types/app";

export type PaymentConfirmation = Payment & {
  fromName: string;
};

export async function getPendingPaymentConfirmations(): Promise<PaymentConfirmation[]> {
  const current = await requireCurrentRoommate();
  const supabase = await createServerSupabaseClient();
  const roommates = await getActiveRoommatesForGroup(current.group_id);
  const names = makeRoommateNameMap(roommates);

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("payments")
    .select("id, from_roommate_id, to_roommate_id, amount_paisa, status, note, created_at")
    .eq("group_id", current.group_id)
    .eq("to_roommate_id", current.id)
    .eq("status", "pending_confirmation")
    .order("created_at", { ascending: false })
    .limit(50);

  return ((data ?? []) as Payment[]).map((payment) => ({
    ...payment,
    fromName: names[payment.from_roommate_id]?.name ?? "Roommate",
  }));
}

