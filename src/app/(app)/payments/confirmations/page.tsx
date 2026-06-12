import { CheckCircle2, XCircle } from "lucide-react";

import { confirmPaymentAction, disputePaymentAction } from "@/lib/actions/payments";
import { formatRupees } from "@/lib/money";
import { getPendingPaymentConfirmations } from "@/lib/queries/payments";
import { Button } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";

export default async function PaymentConfirmationsPage() {
  const payments = await getPendingPaymentConfirmations();

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-sm font-semibold text-emerald-700">Payments</p>
        <h2 className="text-2xl font-bold text-slate-950">Confirmations</h2>
        <p className="text-sm text-slate-500">Confirm only after you actually received the payment.</p>
      </div>
      {payments.length === 0 ? (
        <EmptyState title="No pending confirmations" body="Payment requests from roommates will appear here." />
      ) : (
        payments.map((payment) => (
          <Card key={payment.id} className="grid gap-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-slate-950">{payment.fromName}</p>
                <p className="text-sm text-slate-500">says they paid you</p>
              </div>
              <p className="text-xl font-bold text-slate-950">{formatRupees(payment.amount_paisa)}</p>
            </div>
            {payment.note ? <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{payment.note}</p> : null}
            <form action={confirmPaymentAction} className="grid gap-2">
              <input type="hidden" name="paymentId" value={payment.id} />
              <Input name="note" placeholder="Confirmation note optional" />
              <Button type="submit">
                <CheckCircle2 size={18} />
                Confirm received
              </Button>
            </form>
            <form action={disputePaymentAction} className="grid gap-2">
              <input type="hidden" name="paymentId" value={payment.id} />
              <Field label="Dispute note">
                <Input name="note" placeholder="Example: I have not received this yet" required />
              </Field>
              <Button type="submit" variant="danger">
                <XCircle size={18} />
                Dispute
              </Button>
            </form>
          </Card>
        ))
      )}
    </div>
  );
}
