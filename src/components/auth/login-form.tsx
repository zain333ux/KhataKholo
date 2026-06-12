"use client";

import { useActionState, useEffect } from "react";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

import { loginAction } from "@/lib/actions/auth";
import { emptyActionState } from "@/lib/validators/forms";
import { ActionMessage } from "@/components/ui/action-message";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

export function LoginForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginAction, emptyActionState);

  useEffect(() => {
    if (state.ok) {
      router.replace("/home");
      router.refresh();
    }
  }, [router, state.ok]);

  return (
    <form action={formAction} className="grid gap-4">
      <Field label="Room Code" hint="Capital letters and numbers, e.g. ROOM12">
        <Input
          name="roomCode"
          autoComplete="organization"
          placeholder="ROOM12"
          className="uppercase"
          required
        />
      </Field>
      <Field label="Username or Phone">
        <Input
          name="loginId"
          autoComplete="username"
          placeholder="ali or 03001234567"
          required
        />
      </Field>
      <Field label="6-digit PIN">
        <Input
          name="pin"
          type="password"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          title="PIN must be exactly 6 digits (numbers only)"
          placeholder="••••••"
          autoComplete="current-password"
          required
          onInput={(e) => {
            e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 6);
          }}
        />
      </Field>
      <ActionMessage state={state} />
      <Button type="submit" className="w-full" disabled={isPending}>
        <LogIn size={18} />
        {isPending ? "Logging in…" : "Login"}
      </Button>
    </form>
  );
}
