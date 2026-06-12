import { clsx } from "clsx";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

type FieldProps = {
  label: string;
  hint?: string;
  children: ReactNode;
};

export function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-800">
      <span>{label}</span>
      {children}
      {hint ? <span className="text-xs font-normal text-slate-500">{hint}</span> : null}
    </label>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx(
        "min-h-24 rounded-lg border border-slate-200 bg-white px-3 py-2 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={clsx(
        "min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100",
        className,
      )}
      {...props}
    />
  );
}

