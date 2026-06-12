import { clsx } from "clsx";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:scale-[0.97] active:bg-emerald-800",
  secondary:
    "border border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50 active:scale-[0.97]",
  ghost:
    "text-slate-600 hover:bg-slate-100 active:scale-[0.97]",
  danger:
    "bg-rose-600 text-white shadow-sm hover:bg-rose-700 active:scale-[0.97] active:bg-rose-800",
};

const baseClasses =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-100 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return <button className={clsx(baseClasses, variants[variant], className)} {...props} />;
}

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
};

export function ButtonLink({ className, variant = "primary", href, children, ...props }: ButtonLinkProps) {
  return (
    <Link href={href} className={clsx(baseClasses, variants[variant], className)} {...props}>
      {children}
    </Link>
  );
}
