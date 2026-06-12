import { clsx } from "clsx";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-emerald-700 text-white shadow-sm hover:bg-emerald-800",
  secondary: "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
  ghost: "text-slate-700 hover:bg-slate-100",
  danger: "bg-rose-600 text-white shadow-sm hover:bg-rose-700",
};

const baseClasses =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

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

