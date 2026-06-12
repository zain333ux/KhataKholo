import { CheckCircle, XCircle } from "lucide-react";
import type { ActionState } from "@/lib/validators/forms";

export function ActionMessage({ state }: { state: ActionState }) {
  if (!state.message) {
    return null;
  }

  if (state.ok) {
    return (
      <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5">
        <CheckCircle size={16} className="mt-0.5 shrink-0 text-emerald-600" />
        <p className="text-sm font-medium text-emerald-700">{state.message}</p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5">
      <XCircle size={16} className="mt-0.5 shrink-0 text-rose-600" />
      <p className="text-sm font-medium text-rose-700">{state.message}</p>
    </div>
  );
}
