import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { getCurrentRoommate } from "@/lib/auth/session";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const roommate = await getCurrentRoommate();

  if (roommate) {
    redirect("/home");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center">
        {children}
      </div>
    </main>
  );
}

