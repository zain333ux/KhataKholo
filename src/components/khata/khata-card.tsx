import { ArrowDownLeft, ArrowUpRight, History } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PaymentActionForm } from "@/components/payments/payment-action-form";
import { SendReminderButton } from "@/components/khata/send-reminder-button";
import { formatRupees } from "@/lib/money";
import type { KhataItem } from "@/lib/queries/khata";

export function KhataCard({ item }: { item: KhataItem }) {
  const isOwe = item.direction === "i_owe";

  return (
    <Card className="grid gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-slate-950">{item.otherRoommate.name}</p>
          <p className="text-sm text-slate-500">
            {isOwe ? "You owe this roommate" : "This roommate owes you"}
          </p>
        </div>
        <div className={isOwe ? "text-rose-700" : "text-emerald-700"}>
          {isOwe ? <ArrowUpRight size={22} /> : <ArrowDownLeft size={22} />}
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-950">{formatRupees(item.amountPaisa)}</p>
      <div className="grid grid-cols-1 gap-2">
        <ButtonLink href={`/khata/${item.otherRoommate.id}`} variant="secondary" className="w-full">
          <History size={18} />
          View pair history
        </ButtonLink>
        <PaymentActionForm
          mode={isOwe ? "request_update" : "record_received"}
          otherRoommateId={item.otherRoommate.id}
          maxAmountPaisa={item.amountPaisa}
        />
        {!isOwe ? (
          <SendReminderButton
            toRoommateId={item.otherRoommate.id}
            toName={item.otherRoommate.name}
            toPhone={item.otherRoommate.phone}
            amountPaisa={item.amountPaisa}
          />
        ) : null}
      </div>
    </Card>
  );
}
