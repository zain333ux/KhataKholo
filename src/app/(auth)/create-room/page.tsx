import { DoorOpen } from "lucide-react";
import Link from "next/link";

import { CreateRoomForm } from "@/components/auth/create-room-form";
import { Card } from "@/components/ui/card";

export default function CreateRoomPage() {
  return (
    <Card className="grid gap-6 p-6 shadow-xl">
      <div className="grid gap-3 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-200">
          <DoorOpen size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Create Room</h1>
          <p className="mt-1 text-sm text-slate-500">
            Set up a private khata room for your hostel roommates.
          </p>
        </div>
      </div>

      <CreateRoomForm />

      <p className="text-center text-sm text-slate-500">
        Already have a room?{" "}
        <Link href="/login" className="font-semibold text-emerald-700 hover:underline">
          Login
        </Link>
      </p>
    </Card>
  );
}
