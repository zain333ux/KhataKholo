import Link from "next/link";
import { KeyRound, Shield, UsersRound } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { PinChangeForm } from "@/components/auth/pin-change-form";
import { ButtonLink } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge, Card } from "@/components/ui/card";
import { requireCurrentRoommate } from "@/lib/auth/session";

export default async function ProfilePage() {
  const roommate = await requireCurrentRoommate();

  return (
    <div className="grid gap-5">
      {/* Profile Hero */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center gap-4 bg-gradient-to-br from-emerald-600 to-emerald-700 px-5 py-6">
          <Avatar name={roommate.name} size="lg" className="ring-4 ring-white/30" />
          <div>
            <h2 className="text-xl font-extrabold text-white">{roommate.name}</h2>
            <p className="text-sm text-emerald-100">{roommate.login_id}</p>
            {roommate.phone ? (
              <p className="text-xs text-emerald-200">📞 {roommate.phone}</p>
            ) : null}
          </div>
          <Badge
            tone={roommate.role === "admin" ? "green" : "slate"}
            className="ml-auto self-start bg-white/20 text-white ring-0"
          >
            {roommate.role === "admin" ? <Shield size={11} /> : null}
            {roommate.role}
          </Badge>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Room</p>
          <p className="mt-1 font-bold text-slate-900">{roommate.group.name}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
              {roommate.group.room_code}
            </span>
            <span className="text-xs text-slate-500">Room code</span>
          </div>
        </div>
      </Card>

      {/* Admin link */}
      {roommate.role === "admin" ? (
        <ButtonLink href="/admin/roommates" variant="secondary" className="w-full">
          <UsersRound size={18} />
          Manage Roommates
        </ButtonLink>
      ) : null}

      {/* Change PIN */}
      <Card className="grid gap-4 p-5">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100">
            <KeyRound size={18} className="text-emerald-700" />
          </span>
          <div>
            <h3 className="font-bold text-slate-900">Change PIN</h3>
            <p className="text-xs text-slate-500">Use a 6-digit PIN you can remember.</p>
          </div>
        </div>
        <PinChangeForm />
      </Card>

      {/* Logout */}
      <LogoutButton />

      <p className="text-center text-xs text-slate-400">
        Need help?{" "}
        <Link href="/admin/roommates" className="font-semibold text-slate-600 hover:underline">
          Ask your room admin
        </Link>{" "}
        to reset your PIN.
      </p>
    </div>
  );
}
