"use client";

import { useActionState } from "react";
import { CheckCircle2, Send } from "lucide-react";

import { recordPaymentReceivedAction, requestPaymentUpdateAction } from "@/lib/actions/payments";
import { paisaToRupees } from "@/lib/money";
import { emptyActionState } from "@/lib/validators/forms";
import { ActionMessage } from "@/components/ui/action-message";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

type PaymentActionFormProps = {
  mode: "record_received" | "request_update";
  otherRoommateId: string;
  maxAmountPaisa: number;
};

export function PaymentActionForm({ mode, otherRoommateId, maxAmountPaisa }: PaymentActionFormProps) {
  const action = mode === "record_received" ? recordPaymentReceivedAction : requestPaymentUpdateAction;
  const [state, formAction, isPending] = useActionState(action, emptyActionState);
  const isRecord = mode === "record_received";

  return (
    <form action={formAction} className="grid gap-2">
      <input type="hidden" name={isRecord ? "fromRoommateId" : "toRoommateId"} value={otherRoommateId} />
      <Field label={isRecord ? "Amount received" : "Amount paid"}>
        <Input name="amount" inputMode="decimal" defaultValue={paisaToRupees(maxAmountPaisa)} required />
      </Field>
      <Input name="note" maxLength={500} placeholder="Note optional" />
      <ActionMessage state={state} />
      <Button type="submit" variant={isRecord ? "primary" : "secondary"} disabled={isPending}>
        {isRecord ? <CheckCircle2 size={18} /> : <Send size={18} />}
        {isPending ? "Saving..." : isRecord ? "Record received" : "Request update"}
      </Button>
    </form>
  );
}
