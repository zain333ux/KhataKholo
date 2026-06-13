"use client";

import { clsx } from "clsx";
import { History, Home, PlusCircle, ReceiptText, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/home",        label: "Home",    icon: Home },
  { href: "/khata",       label: "Khata",   icon: ReceiptText },
  { href: "/add-expense", label: "Add",     icon: PlusCircle,  isAdd: true },
  { href: "/history",     label: "History", icon: History },
  { href: "/profile",     label: "Profile", icon: UserRound },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-100 bg-white/95 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-auto grid h-[60px] max-w-md grid-cols-5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          if (item.isAdd) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center active:scale-95 transition-transform duration-75"
                aria-label="Add expense"
              >
                <span
                  className={clsx(
                    "grid h-12 w-12 -translate-y-3 place-items-center rounded-full shadow-lg transition-all duration-150",
                    active
                      ? "bg-emerald-700 ring-4 ring-emerald-100"
                      : "bg-emerald-600 hover:bg-emerald-700",
                  )}
                >
                  <Icon size={24} className="text-white" strokeWidth={2.5} />
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-all active:scale-95 duration-75",
                active ? "text-emerald-700" : "text-slate-400 hover:text-slate-600",
              )}
            >
              <span className={clsx(
                "grid h-7 w-7 place-items-center rounded-lg transition-all",
                active ? "bg-emerald-50" : "",
              )}>
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
