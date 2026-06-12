"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Home, Plus } from "lucide-react";

import { createRoomAction } from "@/lib/actions/auth";
import { emptyActionState } from "@/lib/validators/forms";
import { ActionMessage } from "@/components/ui/action-message";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

export function CreateRoomForm() {
  const [state, formAction, isPending] = useActionState(createRoomAction, emptyActionState);

  return (
    <form action={formAction} className="grid gap-4">
      <Field label="Room name">
        <Input name="roomName" placeholder="Hostel Room 12" required />
      </Field>
      <Field label="Room code" hint="Roommates use this code while logging in.">
        <Input name="roomCode" placeholder="ROOM12" minLength={3} maxLength={20} required />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Your name">
          <Input name="name" autoComplete="name" placeholder="Ali" required />
        </Field>
        <Field label="Username or phone">
          <Input name="loginId" autoComplete="username" placeholder="ali or 03001234567" required />
        </Field>
      </div>
      <Field label="Phone optional">
        <Input name="phone" inputMode="tel" autoComplete="tel" placeholder="03001234567" />
      </Field>
      <Field label="6-digit admin PIN">
        <Input
          name="pin"
          type="password"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          title="PIN must be exactly 6 digits (numbers only)"
          placeholder="123456"
          autoComplete="new-password"
          required
          onInput={(e) => {
            e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 6);
          }}
        />
      </Field>
      <ActionMessage state={state} />
      <Button type="submit" disabled={isPending}>
        {isPending ? <Home size={18} /> : <Plus size={18} />}
        {isPending ? "Creating room..." : "Create room"}
      </Button>
      <p className="text-center text-sm text-slate-500">
        Already have a room?{" "}
        <Link href="/login" className="font-semibold text-emerald-700">
          Login
        </Link>
      </p>
    </form>
  );
}

