import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  PlusCircle,
  ReceiptText,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge, Card, EmptyState } from "@/components/ui/card";
import { formatRupees } from "@/lib/money";
import { getDashboardData } from "@/lib/queries/dashboard";
import { getMyKhata } from "@/lib/queries/khata";

export default async function HomePage() {
  const dashboard = await getDashboardData();
  const khata = await getMyKhata();
  const peopleIOwe = khata.filter((item) => item.direction === "i_owe");
  const peopleOweMe = khata.filter((item) => item.direction === "owes_me");

  const netIsPositive = dashboard.netPaisa >= 0;
  const hasPending =
    dashboard.pendingConfirmations.length > 0 || dashboard.disputes.length > 0;

  return (
    <div className="grid gap-5">
      {/* ── Balance Overview ── */}
      <section className="grid gap-3">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              My Room Khata
            </p>
            <h2 className="text-xl font-extrabold text-slate-900">Balance Overview</h2>
          </div>
          <ButtonLink href="/add-expense" className="h-9 rounded-lg px-3 text-xs">
            <PlusCircle size={14} />
            Add
          </ButtonLink>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="grid gap-2 p-4">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-rose-100">
                <ArrowUpRight size={16} className="text-rose-600" />
              </span>
              <p className="text-xs font-semibold text-rose-600">I Owe</p>
            </div>
            <p className="text-xl font-extrabold text-slate-900">
              {formatRupees(dashboard.totalOwePaisa)}
            </p>
          </Card>
          <Card className="grid gap-2 p-4">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-100">
                <ArrowDownLeft size={16} className="text-emerald-600" />
              </span>
              <p className="text-xs font-semibold text-emerald-600">I Receive</p>
            </div>
            <p className="text-xl font-extrabold text-slate-900">
              {formatRupees(dashboard.totalReceivePaisa)}
            </p>
          </Card>
        </div>

        {/* Net balance */}
        <Card
          className={
            netIsPositive
              ? "flex items-center justify-between gap-3 bg-gradient-to-br from-emerald-600 to-emerald-700 p-4 text-white"
              : "flex items-center justify-between gap-3 bg-gradient-to-br from-rose-600 to-rose-700 p-4 text-white"
          }
        >
          <div>
            <p className="text-xs font-semibold opacity-80">Net Balance</p>
            <p className="text-2xl font-extrabold">{formatRupees(Math.abs(dashboard.netPaisa))}</p>
            <p className="mt-0.5 text-xs opacity-75">
              {netIsPositive ? "Overall you will receive" : "Overall you need to pay"}
            </p>
          </div>
          {netIsPositive ? (
            <TrendingUp size={32} className="shrink-0 opacity-60" />
          ) : (
            <TrendingDown size={32} className="shrink-0 opacity-60" />
          )}
        </Card>
      </section>

      {/* ── Pending Alerts ── */}
      {hasPending && (
        <section className="grid gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Needs Attention</h2>
            <span className="grid h-5 w-5 place-items-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
              {dashboard.pendingConfirmations.length + dashboard.disputes.length}
            </span>
          </div>
          <div className="grid gap-2">
            {dashboard.pendingConfirmations.map((payment) => (
              <Link
                key={payment.id}
                href="/payments/confirmations"
                className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-200">
                  <CheckCircle2 size={16} className="text-amber-700" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">Payment confirmation needed</p>
                  <p className="truncate text-xs text-slate-500">
                    {formatRupees(payment.amount_paisa)} from {payment.fromName}
                  </p>
                </div>
                <Badge tone="amber" className="shrink-0">Pending</Badge>
              </Link>
            ))}
            {dashboard.disputes.map((dispute) => (
              <div
                key={dispute.id}
                className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-rose-200">
                  <Bell size={16} className="text-rose-700" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">Dispute pending</p>
                  <p className="truncate text-xs text-slate-500">{dispute.reason}</p>
                </div>
                <Badge tone="rose" className="shrink-0">Dispute</Badge>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── People section ── */}
      <section className="grid gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">People</h2>
          <Link href="/khata" className="text-xs font-semibold text-emerald-700 hover:underline">
            See all →
          </Link>
        </div>
        <div className="grid gap-3">
          {/* People I owe */}
          <Card className="grid gap-3 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-rose-600">
              People I Owe
            </p>
            {peopleIOwe.length === 0 ? (
              <p className="text-sm text-slate-400">Nobody right now 🎉</p>
            ) : (
              <div className="grid gap-2">
                {peopleIOwe.slice(0, 3).map((item) => (
                  <div key={item.balance.id} className="flex items-center gap-3">
                    <Avatar name={item.otherRoommate.name} size="sm" />
                    <span className="flex-1 text-sm font-medium text-slate-700">
                      {item.otherRoommate.name}
                    </span>
                    <span className="rounded-lg bg-rose-50 px-2 py-1 text-sm font-bold text-rose-700">
                      {formatRupees(item.amountPaisa)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* People who owe me */}
          <Card className="grid gap-3 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
              People Who Owe Me
            </p>
            {peopleOweMe.length === 0 ? (
              <p className="text-sm text-slate-400">Nobody right now.</p>
            ) : (
              <div className="grid gap-2">
                {peopleOweMe.slice(0, 3).map((item) => (
                  <div key={item.balance.id} className="flex items-center gap-3">
                    <Avatar name={item.otherRoommate.name} size="sm" />
                    <span className="flex-1 text-sm font-medium text-slate-700">
                      {item.otherRoommate.name}
                    </span>
                    <span className="rounded-lg bg-emerald-50 px-2 py-1 text-sm font-bold text-emerald-700">
                      {formatRupees(item.amountPaisa)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* ── Recent Expenses ── */}
      <section className="grid gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Recent Expenses</h2>
          <Link href="/history" className="text-xs font-semibold text-emerald-700 hover:underline">
            See all →
          </Link>
        </div>
        {dashboard.recentExpenses.length === 0 ? (
          <EmptyState
            title="No expenses yet"
            body="Add your first shared hostel expense."
            icon={<ReceiptText size={22} />}
          />
        ) : (
          <div className="grid gap-2">
            {dashboard.recentExpenses.map((expense) => (
              <Card key={expense.id} className="flex items-center gap-3 p-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100">
                  <ReceiptText size={18} className="text-slate-500" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{expense.title}</p>
                  <p className="text-xs text-slate-500">Paid by {expense.paidByName}</p>
                </div>
                <p className="shrink-0 font-bold text-slate-900">
                  {formatRupees(expense.amount_paisa)}
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
