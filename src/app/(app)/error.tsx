"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AppError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <section className="grid min-h-[55vh] place-items-center px-4 text-center">
      <div className="grid max-w-sm gap-4 rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-100 text-amber-700">
          <AlertTriangle size={26} />
        </span>
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Couldn&apos;t load this page</h2>
          <p className="mt-2 text-sm text-slate-600">
            The room service may be waking up. Your data is safe; wait a moment and try again.
          </p>
        </div>
        <Button type="button" onClick={unstable_retry}>
          <RefreshCw size={17} />
          Try again
        </Button>
      </div>
    </section>
  );
}
