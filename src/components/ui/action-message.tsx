import type { ActionState } from "@/lib/validators/forms";

export function ActionMessage({ state }: { state: ActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p
      className={
        state.ok
          ? "rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700"
          : "rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700"
      }
    >
      {state.message}
    </p>
  );
}

