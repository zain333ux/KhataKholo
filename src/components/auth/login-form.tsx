"use client";

import { useActionState, useEffect, useState } from "react";
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
  const [roomCode, setRoomCode] = useState("");
  const [roomCodeError, setRoomCodeError] = useState("");

  useEffect(() => {
    if (state.ok) {
      router.replace("/home");
      router.refresh();
    }
  }, [router, state.ok]);

  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    
    // Auto-convert to uppercase
    val = val.toUpperCase();
    
    // Trim spaces / remove spaces
    val = val.replace(/\s/g, "");
    
    setRoomCode(val);

    // Validate: only A-Z and 0-9 are allowed
    if (/[^A-Z0-9]/.test(val)) {
      const errorMsg = "Use capital letters and numbers only, e.g. ROOM12";
      setRoomCodeError(errorMsg);
      e.target.setCustomValidity(errorMsg);
    } else if (val.length > 0 && val.length < 3) {
      const errorMsg = "Room code must be at least 3 characters.";
      setRoomCodeError(errorMsg);
      e.target.setCustomValidity(errorMsg);
    } else {
      setRoomCodeError("");
      e.target.setCustomValidity("");
    }
  };

  return (
    <form action={formAction} className="grid gap-4">
      <Field 
        label="Room Code" 
        hint="Ask your room admin for the room code."
        error={roomCodeError}
      >
        <Input
          name="roomCode"
          autoComplete="organization"
          placeholder="ROOM12"
          className="uppercase"
          value={roomCode}
          onChange={handleRoomCodeChange}
          required
        />
      </Field>
      <Field 
        label="Username or Phone" 
        hint="Enter the username/phone created for you."
      >
        <Input
          name="loginId"
          autoComplete="username"
          placeholder="ali or 03001234567"
          required
        />
      </Field>
      <Field 
        label="6-digit PIN" 
        hint="Enter the PIN created for you."
      >
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
      <Button type="submit" className="w-full" loading={isPending}>
        {!isPending && <LogIn size={18} />}
        {isPending ? "Logging in…" : "Login"}
      </Button>
    </form>
  );
}
