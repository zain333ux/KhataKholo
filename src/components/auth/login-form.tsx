"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
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
      <Field label="Room code">
        <Input name="roomCode" autoComplete="organization" placeholder="ROOM12" required />
      </Field>
      <Field label="Username or phone">
        <Input name="loginId" autoComplete="username" placeholder="ali or 03001234567" required />
      </Field>
      <Field label="6-digit PIN">
        <Input
          name="pin"
          type="password"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          title="PIN must be exactly 6 digits (numbers only)"
          placeholder="123456"
          autoComplete="current-password"
          required
          onInput={(e) => {
            e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 6);
          }}
        />
      </Field>
      <ActionMessage state={state} />
      <Button type="submit" disabled={isPending}>
        <LogIn size={18} />
        {isPending ? "Logging in..." : "Login"}
      </Button>
      <p className="text-center text-sm text-slate-500">
        New room?{" "}
        <Link href="/create-room" className="font-semibold text-emerald-700">
          Create one
        </Link>
      </p>
    </form>
  );
}
