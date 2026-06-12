import { ArrowDownLeft, ArrowUpRight, History } from "lucide-react";


import { ButtonLink } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { PaymentActionForm } from "@/components/payments/payment-action-form";
import { SendReminderButton } from "@/components/khata/send-reminder-button";
import { formatRupees } from "@/lib/money";
import type { KhataItem } from "@/lib/queries/khata";

export function KhataCard({ item }: { item: KhataItem }) {
  const isOwe = item.direction === "i_owe";

  return (
    <Card className="overflow-hidden p-0">
      {/* Coloured header strip */}
      <div
        className={
          isOwe
            ? "flex items-center gap-3 bg-gradient-to-r from-rose-50 to-rose-100/60 px-4 py-3"
            : "flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-emerald-100/60 px-4 py-3"
        }
      >
        <Avatar name={item.otherRoommate.name} size="md" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900">{item.otherRoommate.name}</p>
          <p className={isOwe ? "text-xs text-rose-600 font-medium" : "text-xs text-emerald-600 font-medium"}>
            {isOwe ? "You owe this person" : "Owes you money"}
          </p>
        </div>
        <div
          className={
            isOwe
              ? "grid h-8 w-8 place-items-center rounded-full bg-rose-100"
              : "grid h-8 w-8 place-items-center rounded-full bg-emerald-100"
          }
        >
          {isOwe ? (
            <ArrowUpRight size={18} className="text-rose-600" />
          ) : (
            <ArrowDownLeft size={18} className="text-emerald-600" />
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="px-4 py-3">
        <p
          className={
            isOwe
              ? "text-3xl font-extrabold text-rose-700"
              : "text-3xl font-extrabold text-emerald-700"
          }
        >
          {formatRupees(item.amountPaisa)}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          {isOwe ? "Total you owe" : "Total they owe you"}
        </p>
      </div>

      {/* Action buttons */}
      <div className="grid gap-2 border-t border-slate-100 px-4 pb-4 pt-3">
        <ButtonLink
          href={`/khata/${item.otherRoommate.id}`}
          variant="secondary"
          className="w-full"
        >
          <History size={16} />
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
