"use client";

import { useActionState } from "react";
import { Plus, RotateCcw, Save, UserMinus } from "lucide-react";

import {
  addRoommateAction,
  deactivateRoommateAction,
  resetRoommatePinAction,
  updateRoommateAction,
} from "@/lib/actions/admin";
import { emptyActionState } from "@/lib/validators/forms";
import type { RoommateListItem } from "@/types/app";
import { ActionMessage } from "@/components/ui/action-message";
import { Badge, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";

export function AdminRoommatesPanel({ roommates }: { roommates: RoommateListItem[] }) {
  const [addState, addAction, addPending] = useActionState(addRoommateAction, emptyActionState);
  const [updateState, updateAction, updatePending] = useActionState(updateRoommateAction, emptyActionState);
  const [resetState, resetAction, resetPending] = useActionState(resetRoommatePinAction, emptyActionState);

  return (
    <div className="grid gap-4">
      <Card className="grid gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Add roommate</h2>
          <p className="text-sm text-slate-500">Give them a login id and temporary 6-digit PIN.</p>
        </div>
        <form action={addAction} className="grid gap-3">
          <Field label="Name">
            <Input name="name" placeholder="Bilal" required />
          </Field>
          <Field label="Username or phone">
            <Input name="loginId" placeholder="bilal or 03001234567" required />
          </Field>
          <Field label="Phone optional">
            <Input name="phone" inputMode="tel" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Role">
              <Select name="role" defaultValue="member">
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </Select>
            </Field>
            <Field label="PIN">
              <Input
                name="pin"
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
          </div>
          <ActionMessage state={addState} />
          <Button type="submit" disabled={addPending}>
            <Plus size={18} />
            {addPending ? "Adding..." : "Add roommate"}
          </Button>
        </form>
      </Card>

      <ActionMessage state={updateState} />
      <ActionMessage state={resetState} />

      {roommates.map((roommate) => (
        <Card key={roommate.id} className="grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-bold text-slate-950">{roommate.name}</p>
              <p className="text-sm text-slate-500">{roommate.login_id}</p>
            </div>
            <div className="flex gap-2">
              <Badge tone={roommate.is_active ? "green" : "rose"}>{roommate.is_active ? "Active" : "Removed"}</Badge>
              <Badge tone={roommate.role === "admin" ? "blue" : "slate"}>{roommate.role}</Badge>
            </div>
          </div>

          <form action={updateAction} className="grid gap-3">
            <input type="hidden" name="roommateId" value={roommate.id} />
            <Field label="Name">
              <Input name="name" defaultValue={roommate.name} required />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone">
                <Input name="phone" defaultValue={roommate.phone ?? ""} inputMode="tel" />
              </Field>
              <Field label="Role">
                <Select name="role" defaultValue={roommate.role}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </Select>
              </Field>
            </div>
            <Button type="submit" variant="secondary" disabled={updatePending || !roommate.is_active}>
              <Save size={18} />
              Save
            </Button>
          </form>

          <form action={resetAction} className="grid grid-cols-[1fr_auto] gap-2">
            <input type="hidden" name="roommateId" value={roommate.id} />
            <Input
              name="newPin"
              placeholder="New 6-digit PIN"
              type="password"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              title="PIN must be exactly 6 digits (numbers only)"
              required
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 6);
              }}
            />
            <Button type="submit" variant="secondary" disabled={resetPending || !roommate.is_active} aria-label={`Reset PIN for ${roommate.name}`}>
              <RotateCcw size={18} />
            </Button>
          </form>

          <form action={deactivateRoommateAction}>
            <input type="hidden" name="roommateId" value={roommate.id} />
            <Button type="submit" variant="ghost" className="w-full text-rose-700" disabled={!roommate.is_active}>
              <UserMinus size={18} />
              Remove roommate
            </Button>
          </form>
        </Card>
      ))}
    </div>
  );
}
