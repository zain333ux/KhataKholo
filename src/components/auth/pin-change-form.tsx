"use client";

import { useActionState } from "react";
import { KeyRound } from "lucide-react";

import { changePinAction } from "@/lib/actions/auth";
import { emptyActionState } from "@/lib/validators/forms";
import { ActionMessage } from "@/components/ui/action-message";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

export function PinChangeForm() {
  const [state, formAction, isPending] = useActionState(changePinAction, emptyActionState);

  return (
    <form action={formAction} className="grid gap-3">
      <Field label="Current PIN">
        <Input
          name="oldPin"
          type="password"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          title="PIN must be exactly 6 digits (numbers only)"
          placeholder="123456"
          required
          onInput={(e) => {
            e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 6);
          }}
        />
      </Field>
      <Field label="New PIN">
        <Input
          name="newPin"
          type="password"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          title="PIN must be exactly 6 digits (numbers only)"
          placeholder="123456"
          required
          onInput={(e) => {
            e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 6);
          }}
        />
      </Field>
      <ActionMessage state={state} />
      <Button type="submit" loading={isPending}>
        {!isPending && <KeyRound size={18} />}
        {isPending ? "Changing..." : "Change PIN"}
      </Button>
    </form>
  );
}

