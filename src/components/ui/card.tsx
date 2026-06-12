import { clsx } from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("rounded-lg border border-slate-200 bg-white p-4 shadow-sm", className)}
      {...props}
    />
  );
}

type BadgeProps = {
  children: ReactNode;
  tone?: "green" | "amber" | "rose" | "slate" | "blue";
};

const badgeTones: Record<NonNullable<BadgeProps["tone"]>, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
  blue: "bg-sky-50 text-sky-700 ring-sky-100",
};

export function Badge({ children, tone = "slate" }: BadgeProps) {
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1", badgeTones[tone])}>
      {children}
    </span>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-center">
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{body}</p>
    </div>
  );
}

