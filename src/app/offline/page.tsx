"use client";

import { WifiOff } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-emerald-50 via-white to-slate-100 px-6 text-center">
      {/* Icon */}
      <div className="grid h-20 w-20 place-items-center rounded-3xl bg-slate-100 text-slate-400">
        <WifiOff size={36} />
      </div>

      {/* App mark */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">KhataKholo</p>
        <h1 className="mt-1 text-2xl font-extrabold text-slate-900">You're offline</h1>
        <p className="mt-2 max-w-xs text-sm text-slate-500">
          No internet connection right now. Your data is safe — reconnect to sync your khata.
        </p>
      </div>

      {/* Retry button */}
      <button
        onClick={() => window.location.reload()}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-semibold text-white shadow-sm transition active:scale-95 hover:bg-emerald-700"
      >
        Try again
      </button>

      <p className="text-xs text-slate-400">
        Once reconnected,{" "}
        <Link href="/home" className="font-semibold text-emerald-700 underline underline-offset-2">
          go to your home
        </Link>
        .
      </p>
    </main>
  );
}
