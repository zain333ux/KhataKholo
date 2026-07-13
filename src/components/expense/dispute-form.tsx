"use client";

import { useActionState } from "react";
import { AlertTriangle } from "lucide-react";

import { raiseDisputeAction } from "@/lib/actions/expenses";
import { emptyActionState } from "@/lib/validators/forms";
import { ActionMessage } from "@/components/ui/action-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";

export function DisputeForm({ expenseId }: { expenseId: string }) {
  const [state, formAction, isPending] = useActionState(raiseDisputeAction, emptyActionState);

  return (
    <Card className="grid gap-3">
      <div className="flex items-center gap-2">
        <AlertTriangle size={18} className="text-amber-600" />
        <h3 className="font-bold text-slate-950">Raise dispute</h3>
      </div>
      <form action={formAction} className="grid gap-3">
        <input type="hidden" name="expenseId" value={expenseId} readOnly />
        <Field label="Reason">
          <Select name="reason" defaultValue="My share amount is wrong.">
            <option>I was not included in this expense.</option>
            <option>My share amount is wrong.</option>
            <option>The total amount is incorrect.</option>
            <option>The receipt or note is unclear.</option>
          </Select>
        </Field>
        <Field label="Suggested correction optional">
          <Input name="suggestedCorrection" inputMode="decimal" placeholder="300" />
        </Field>
        <Field label="Extra note optional">
          <Textarea name="extraNote" maxLength={400} placeholder="Write a short note for context" />
        </Field>
        <ActionMessage state={state} />
        <Button type="submit" variant="secondary" disabled={isPending}>
          <AlertTriangle size={18} />
          {isPending ? "Raising..." : "Raise dispute"}
        </Button>
      </form>
    </Card>
  );
}
