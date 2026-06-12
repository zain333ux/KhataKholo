import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { requireCurrentRoommate } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const roommate = await requireCurrentRoommate();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <AppHeader roommate={roommate} />
      <main className="mx-auto max-w-md px-4 py-4">{children}</main>
      <BottomNav />
    </div>
  );
}

