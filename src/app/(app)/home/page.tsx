import { ArrowDownLeft, ArrowUpRight, Clock, PlusCircle } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { formatRupees } from "@/lib/money";
import { getDashboardData } from "@/lib/queries/dashboard";
import { getMyKhata } from "@/lib/queries/khata";

export default async function HomePage() {
  const dashboard = await getDashboardData();
  const khata = await getMyKhata();
  const peopleIOwe = khata.filter((item) => item.direction === "i_owe");
  const peopleOweMe = khata.filter((item) => item.direction === "owes_me");

  return (
    <div className="grid gap-4">
      <section className="grid gap-3">
        <div>
          <p className="text-sm font-semibold text-emerald-700">My room khata</p>
          <h2 className="text-2xl font-bold text-slate-950">Today&apos;s balance</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <div className="flex items-center gap-2 text-rose-700">
              <ArrowUpRight size={18} />
              <p className="text-sm font-semibold">I owe</p>
            </div>
            <p className="mt-2 text-xl font-bold text-slate-950">{formatRupees(dashboard.totalOwePaisa)}</p>
          </Card>
          <Card>
            <div className="flex items-center gap-2 text-emerald-700">
              <ArrowDownLeft size={18} />
              <p className="text-sm font-semibold">I receive</p>
            </div>
            <p className="mt-2 text-xl font-bold text-slate-950">{formatRupees(dashboard.totalReceivePaisa)}</p>
          </Card>
        </div>
        <Card className="flex items-center justify-between gap-3 bg-slate-950 text-white">
          <div>
            <p className="text-sm text-slate-300">Net balance</p>
            <p className="text-2xl font-bold">{formatRupees(dashboard.netPaisa)}</p>
          </div>
          <ButtonLink href="/add-expense" className="bg-white text-slate-950 hover:bg-slate-100">
            <PlusCircle size={18} />
            Add
          </ButtonLink>
        </Card>
      </section>

      <section className="grid gap-3">
        <h2 className="text-lg font-bold text-slate-950">People</h2>
        <div className="grid gap-3">
          <Card className="grid gap-2">
            <p className="font-semibold text-rose-700">People I owe</p>
            {peopleIOwe.length === 0 ? (
              <p className="text-sm text-slate-500">Nobody right now.</p>
            ) : (
              peopleIOwe.slice(0, 3).map((item) => (
                <div key={item.balance.id} className="flex justify-between gap-3 text-sm">
                  <span className="text-slate-600">{item.otherRoommate.name}</span>
                  <span className="font-bold text-slate-950">{formatRupees(item.amountPaisa)}</span>
                </div>
              ))
            )}
          </Card>
          <Card className="grid gap-2">
            <p className="font-semibold text-emerald-700">People who owe me</p>
            {peopleOweMe.length === 0 ? (
              <p className="text-sm text-slate-500">Nobody right now.</p>
            ) : (
              peopleOweMe.slice(0, 3).map((item) => (
                <div key={item.balance.id} className="flex justify-between gap-3 text-sm">
                  <span className="text-slate-600">{item.otherRoommate.name}</span>
                  <span className="font-bold text-slate-950">{formatRupees(item.amountPaisa)}</span>
                </div>
              ))
            )}
          </Card>
        </div>
      </section>

      <section className="grid gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-950">Pending items</h2>
          <Clock size={18} className="text-slate-500" />
        </div>
        {dashboard.pendingConfirmations.length === 0 && dashboard.disputes.length === 0 ? (
          <EmptyState title="All clear" body="No pending payment confirmations or disputes." />
        ) : (
          <div className="grid gap-2">
            {dashboard.pendingConfirmations.map((payment) => (
              <Card key={payment.id} className="text-sm">
                <p className="font-semibold text-slate-950">Payment confirmation needed</p>
                <p className="text-slate-500">{formatRupees(payment.amount_paisa)} from {payment.fromName}</p>
              </Card>
            ))}
            {dashboard.disputes.map((dispute) => (
              <Card key={dispute.id} className="text-sm">
                <p className="font-semibold text-slate-950">Dispute pending</p>
                <p className="text-slate-500">{dispute.reason}</p>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-3">
        <h2 className="text-lg font-bold text-slate-950">Recent expenses</h2>
        {dashboard.recentExpenses.length === 0 ? (
          <EmptyState title="No expenses yet" body="Add the first shared hostel expense." />
        ) : (
          dashboard.recentExpenses.map((expense) => (
            <Card key={expense.id} className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-950">{expense.title}</p>
                <p className="text-sm text-slate-500">Paid by {expense.paidByName}</p>
              </div>
              <p className="font-bold text-slate-950">{formatRupees(expense.amount_paisa)}</p>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
