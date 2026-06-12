"use client";

import { clsx } from "clsx";
import { History, Home, PlusCircle, ReceiptText, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/add-expense", label: "Add", icon: PlusCircle },
  { href: "/khata", label: "Khata", icon: ReceiptText },
  { href: "/history", label: "History", icon: History },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto grid h-16 max-w-md grid-cols-5 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-col items-center justify-center gap-1 rounded-lg text-xs font-semibold",
                active ? "text-emerald-700" : "text-slate-500",
              )}
            >
              <Icon size={21} strokeWidth={active ? 2.6 : 2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

