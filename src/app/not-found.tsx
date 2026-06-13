import Link from "next/link";
import { Compass } from "lucide-react";
import { getCurrentRoommate } from "@/lib/auth/session";

export default async function NotFound() {
  const roommate = await getCurrentRoommate();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-emerald-50 via-white to-slate-100 px-6 text-center">
      {/* Icon */}
      <div className="grid h-20 w-20 place-items-center rounded-3xl bg-white shadow-md text-emerald-600">
        <Compass size={36} className="animate-pulse" />
      </div>

      {/* Message */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">404 Error</p>
        <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Page Not Found</h1>
        <p className="mt-2 max-w-xs text-sm text-slate-500">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
      </div>

      {/* Action Button */}
      <Link
        href={roommate ? "/home" : "/login"}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-semibold text-white shadow-sm transition active:scale-[0.97] hover:bg-emerald-700 touch-manipulation"
      >
        {roommate ? "Go Home" : "Go to Login"}
      </Link>
    </main>
  );
}
