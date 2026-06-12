import { clsx } from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_4px_0_rgb(0,0,0,0.07)]",
        className,
      )}
      {...props}
    />
  );
}

type BadgeProps = {
  children: ReactNode;
  tone?: "green" | "amber" | "rose" | "slate" | "blue";
  className?: string;
};

const badgeTones: Record<NonNullable<BadgeProps["tone"]>, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  rose:  "bg-rose-50 text-rose-700 ring-rose-200",
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
  blue:  "bg-sky-50 text-sky-700 ring-sky-200",
};

export function Badge({ children, tone = "slate", className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1",
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

type EmptyStateProps = {
  title: string;
  body: string;
  icon?: ReactNode;
};

export function EmptyState({ title, body, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-10 text-center">
      {icon ? (
        <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
          {icon}
        </div>
      ) : null}
      <div>
        <p className="font-semibold text-slate-800">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{body}</p>
      </div>
    </div>
  );
}
