import { ShieldCheck } from "lucide-react";

import type { CurrentRoommate } from "@/types/app";
import { Badge } from "@/components/ui/card";

export function AppHeader({ roommate }: { roommate: CurrentRoommate }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-slate-50/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{roommate.group.room_code}</p>
          <h1 className="text-lg font-bold text-slate-950">{roommate.group.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          {roommate.role === "admin" ? (
            <Badge tone="green">
              <ShieldCheck size={13} />
              Admin
            </Badge>
          ) : null}
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-700 text-sm font-bold text-white">
            {roommate.name.slice(0, 1).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}

