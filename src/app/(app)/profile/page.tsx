import Link from "next/link";
import { UsersRound } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { PinChangeForm } from "@/components/auth/pin-change-form";
import { ButtonLink } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/card";
import { requireCurrentRoommate } from "@/lib/auth/session";

export default async function ProfilePage() {
  const roommate = await requireCurrentRoommate();

  return (
    <div className="grid gap-4">
      <Card className="grid gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950">{roommate.name}</h2>
            <p className="text-sm text-slate-500">{roommate.login_id}</p>
          </div>
          <Badge tone={roommate.role === "admin" ? "green" : "slate"}>{roommate.role}</Badge>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">{roommate.group.name}</p>
          <p>Room code: {roommate.group.room_code}</p>
          {roommate.phone ? <p>Phone: {roommate.phone}</p> : null}
        </div>
      </Card>

      {roommate.role === "admin" ? (
        <ButtonLink href="/admin/roommates" variant="secondary" className="w-full">
          <UsersRound size={18} />
          Manage roommates
        </ButtonLink>
      ) : null}

      <Card className="grid gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Change PIN</h2>
          <p className="text-sm text-slate-500">Use a 6-digit PIN you can remember.</p>
        </div>
        <PinChangeForm />
      </Card>

      <LogoutButton />

      <p className="text-center text-xs text-slate-400">
        Need admin help? Ask your room admin to reset your PIN from{" "}
        <Link href="/admin/roommates" className="font-semibold text-slate-600">
          roommates
        </Link>
        .
      </p>
    </div>
  );
}

