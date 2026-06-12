import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ReceiptText, Users } from "lucide-react";

import { DisputeForm } from "@/components/expense/dispute-form";
import { Badge, Card } from "@/components/ui/card";
import { formatRupees } from "@/lib/money";
import { getExpenseDetail } from "@/lib/queries/expenses";

export default async function ExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getExpenseDetail(id);

  return (
    <div className="grid gap-4">
      {/* Back link */}
      <Link
        href="/history"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:underline"
      >
        <ArrowLeft size={16} />
        Back to History
      </Link>

      {/* Hero */}
      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-5 py-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Expense</p>
              <h2 className="mt-1 text-2xl font-extrabold text-white">{detail.expense.title}</h2>
              <p className="mt-0.5 text-sm text-slate-400">Paid by {detail.paidByName}</p>
            </div>
            <Badge tone={detail.expense.split_type === "equal" ? "green" : "amber"}>
              {detail.expense.split_type}
            </Badge>
          </div>
          <p className="mt-4 text-3xl font-extrabold text-white">
            {formatRupees(detail.expense.amount_paisa)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-0 divide-x divide-slate-100 border-t border-slate-100">
          <div className="px-4 py-3">
            <p className="text-xs font-semibold text-slate-400">Date</p>
            <p className="mt-0.5 font-semibold text-slate-900">{detail.expense.expense_date}</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs font-semibold text-slate-400">My Share</p>
            <p className="mt-0.5 font-bold text-emerald-700">
              {formatRupees(detail.currentUserSharePaisa)}
            </p>
          </div>
        </div>

        {detail.expense.note ? (
          <div className="border-t border-slate-100 px-4 py-3">
            <p className="text-xs font-semibold text-slate-400">Note</p>
            <p className="mt-0.5 text-sm text-slate-700">{detail.expense.note}</p>
          </div>
        ) : null}
      </Card>

      {/* Members */}
      <Card className="grid gap-3">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-slate-400" />
          <h3 className="font-bold text-slate-900">Included Roommates</h3>
        </div>
        <div className="grid gap-2">
          {detail.members.map((member) => (
            <div
              key={member.id}
              className={[
                "flex items-center justify-between gap-3 rounded-xl px-3 py-2.5",
                member.isCurrentUser ? "bg-emerald-50" : "bg-slate-50",
              ].join(" ")}
            >
              <div>
                <p className="font-semibold text-slate-900">{member.roommateName}</p>
                {member.isCurrentUser ? (
                  <p className="text-xs font-medium text-emerald-600">Your share</p>
                ) : null}
              </div>
              <p className={member.isCurrentUser ? "font-bold text-emerald-700" : "font-bold text-slate-900"}>
                {formatRupees(member.share_paisa)}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Receipt */}
      {detail.expense.receipt_url ? (
        <Card className="grid gap-3">
          <div className="flex items-center gap-2">
            <ReceiptText size={16} className="text-slate-400" />
            <h3 className="font-bold text-slate-900">Receipt</h3>
          </div>
          <Image
            src={detail.expense.receipt_url}
            alt={`${detail.expense.title} receipt`}
            width={640}
            height={640}
            className="h-auto w-full rounded-xl border border-slate-100 object-cover"
          />
        </Card>
      ) : null}

      {/* Disputes */}
      {detail.disputes.length > 0 ? (
        <Card className="grid gap-3">
          <h3 className="font-bold text-slate-900">Disputes</h3>
          {detail.disputes.map((dispute) => (
            <div key={dispute.id} className="rounded-xl bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-900">{dispute.raisedByName}</p>
                <Badge
                  tone={
                    dispute.status === "pending"
                      ? "amber"
                      : dispute.status === "resolved"
                      ? "green"
                      : "rose"
                  }
                >
                  {dispute.status}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-slate-600">{dispute.reason}</p>
              {dispute.suggested_correction_paisa !== null ? (
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  Suggested: {formatRupees(dispute.suggested_correction_paisa)}
                </p>
              ) : null}
            </div>
          ))}
        </Card>
      ) : null}

      {detail.isCurrentUserIncluded ? <DisputeForm expenseId={detail.expense.id} /> : null}
    </div>
  );
}
