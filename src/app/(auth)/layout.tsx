import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { getCurrentRoommate } from "@/lib/auth/session";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const roommate = await getCurrentRoommate();

  if (roommate) {
    redirect("/home");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-slate-100 px-4 py-10">
      {/* Decorative background blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-sky-200/30 blur-3xl"
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-md flex-col justify-center gap-6">
        {/* Brand mark */}
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600">
            Room Khata
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Private expense splitting for hostel roommates
          </p>
        </div>

        {children}

        <p className="text-center text-xs text-slate-400">
          Your data stays private within your room.
        </p>
      </div>
    </main>
  );
}
