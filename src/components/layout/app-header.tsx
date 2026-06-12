import { ShieldCheck } from "lucide-react";
import Link from "next/link";

import type { CurrentRoommate } from "@/types/app";
import { Badge } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";

export function AppHeader({ roommate }: { roommate: CurrentRoommate }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
            {roommate.group.room_code}
          </p>
          <h1 className="text-base font-bold text-slate-900">{roommate.group.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          {roommate.role === "admin" ? (
            <Badge tone="green">
              <ShieldCheck size={12} />
              Admin
            </Badge>
          ) : null}
          <Link href="/profile" aria-label="Profile">
            <Avatar name={roommate.name} size="md" />
          </Link>
        </div>
      </div>
    </header>
  );
}
