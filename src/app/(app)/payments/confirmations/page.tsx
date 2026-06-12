import { CheckCircle2, Clock, XCircle } from "lucide-react";

import { confirmPaymentAction, disputePaymentAction } from "@/lib/actions/payments";
import { formatRupees } from "@/lib/money";
import { getPendingPaymentConfirmations } from "@/lib/queries/payments";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";

export default async function PaymentConfirmationsPage() {
  const payments = await getPendingPaymentConfirmations();

  return (
    <div className="grid gap-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Payments</p>
        <h2 className="text-xl font-extrabold text-slate-900">Confirmations</h2>
        <p className="mt-1 text-xs text-slate-500">
          Confirm only after you actually received the payment.
        </p>
      </div>

      {payments.length === 0 ? (
        <EmptyState
          title="No pending confirmations"
          body="Payment requests from roommates will appear here."
          icon={<CheckCircle2 size={22} />}
        />
      ) : (
        payments.map((payment) => (
          <Card key={payment.id} className="grid gap-4 p-0 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 bg-amber-50 px-4 py-3">
              <Avatar name={payment.fromName} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900">{payment.fromName}</p>
                <p className="text-xs text-slate-500">says they paid you</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-extrabold text-emerald-700">
                  {formatRupees(payment.amount_paisa)}
                </p>
                <div className="flex items-center justify-end gap-1 text-xs text-amber-600">
                  <Clock size={11} />
                  <span>Pending</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 px-4 pb-4">
              {payment.note ? (
                <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  💬 {payment.note}
                </p>
              ) : null}

              {/* Confirm form */}
              <div className="grid gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Confirm receipt
                </p>
                <form action={confirmPaymentAction} className="grid gap-2">
                  <input type="hidden" name="paymentId" value={payment.id} />
                  <Input name="note" placeholder="Optional confirmation note…" />
                  <Button type="submit" className="w-full">
                    <CheckCircle2 size={18} />
                    Yes, I received this payment
                  </Button>
                </form>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-2">
                <div className="flex-1 border-t border-slate-100" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  or
                </span>
                <div className="flex-1 border-t border-slate-100" />
              </div>

              {/* Dispute form */}
              <div className="grid gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Dispute payment
                </p>
                <form action={disputePaymentAction} className="grid gap-2">
                  <input type="hidden" name="paymentId" value={payment.id} />
                  <Field label="Reason for dispute">
                    <Input
                      name="note"
                      placeholder="e.g. I have not received this yet"
                      required
                    />
                  </Field>
                  <Button type="submit" variant="danger" className="w-full">
                    <XCircle size={18} />
                    Dispute this payment
                  </Button>
                </form>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
