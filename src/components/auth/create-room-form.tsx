"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { createRoomAction } from "@/lib/actions/auth";
import { emptyActionState } from "@/lib/validators/forms";
import { ActionMessage } from "@/components/ui/action-message";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

export function CreateRoomForm() {
  const [state, formAction, isPending] = useActionState(createRoomAction, emptyActionState);
  const [roomCode, setRoomCode] = useState("");
  const [roomCodeError, setRoomCodeError] = useState("");

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
      <Field label="Room name">
        <Input name="roomName" minLength={2} maxLength={80} placeholder="Hostel Room 12" required />
      </Field>
      <Field 
        label="Room code" 
        hint="Use capital letters and numbers only, e.g. ROOM12"
        error={roomCodeError}
      >
        <Input 
          name="roomCode" 
          placeholder="ROOM12" 
          minLength={3} 
          maxLength={20} 
          value={roomCode}
          onChange={handleRoomCodeChange}
          required 
        />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Your name">
          <Input name="name" minLength={2} maxLength={80} autoComplete="name" placeholder="Ali" required />
        </Field>
        <Field label="Username or phone" hint="This will be used to login.">
          <Input name="loginId" minLength={2} maxLength={80} autoComplete="username" placeholder="ali or 03001234567" required />
        </Field>
      </div>
      <Field label="Phone (optional)">
        <Input name="phone" inputMode="tel" autoComplete="tel" placeholder="03001234567" />
      </Field>
      <Field label="6-digit admin PIN" hint="Use a 6-digit PIN. Remember it for login.">
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
      <Button type="submit" loading={isPending}>
        {!isPending && <Plus size={18} />}
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
