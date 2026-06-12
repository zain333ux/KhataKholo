import Image from "next/image";
import Link from "next/link";

import { DisputeForm } from "@/components/expense/dispute-form";
import { Badge, Card } from "@/components/ui/card";
import { formatRupees } from "@/lib/money";
import { getExpenseDetail } from "@/lib/queries/expenses";

export default async function ExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getExpenseDetail(id);

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-sm font-semibold text-emerald-700">Expense</p>
        <h2 className="text-2xl font-bold text-slate-950">{detail.expense.title}</h2>
        <p className="text-sm text-slate-500">Paid by {detail.paidByName}</p>
      </div>

      <Card className="grid gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Total amount</p>
            <p className="text-3xl font-bold text-slate-950">{formatRupees(detail.expense.amount_paisa)}</p>
          </div>
          <Badge tone={detail.expense.split_type === "equal" ? "green" : "amber"}>{detail.expense.split_type}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-sm">
          <div>
            <p className="font-semibold text-slate-900">Date</p>
            <p className="text-slate-500">{detail.expense.expense_date}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">My share</p>
            <p className="text-slate-500">{formatRupees(detail.currentUserSharePaisa)}</p>
          </div>
        </div>
        {detail.expense.note ? <p className="text-sm text-slate-600">{detail.expense.note}</p> : null}
      </Card>

      <Card className="grid gap-3">
        <h3 className="font-bold text-slate-950">Included roommates</h3>
        {detail.members.map((member) => (
          <div key={member.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
            <div>
              <p className="font-semibold text-slate-900">{member.roommateName}</p>
              {member.isCurrentUser ? <p className="text-xs text-emerald-700">Your share</p> : null}
            </div>
            <p className="font-bold text-slate-950">{formatRupees(member.share_paisa)}</p>
          </div>
        ))}
      </Card>

      {detail.expense.receipt_url ? (
        <Card className="grid gap-3">
          <h3 className="font-bold text-slate-950">Receipt</h3>
          <Image
            src={detail.expense.receipt_url}
            alt={`${detail.expense.title} receipt`}
            width={640}
            height={640}
            className="h-auto w-full rounded-lg border border-slate-200 object-cover"
          />
        </Card>
      ) : null}

      {detail.disputes.length > 0 ? (
        <Card className="grid gap-3">
          <h3 className="font-bold text-slate-950">Disputes</h3>
          {detail.disputes.map((dispute) => (
            <div key={dispute.id} className="rounded-lg bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-900">{dispute.raisedByName}</p>
                <Badge tone={dispute.status === "pending" ? "amber" : dispute.status === "resolved" ? "green" : "rose"}>
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

      <Link href="/history" className="text-center text-sm font-semibold text-emerald-700">
        Back to history
      </Link>
    </div>
  );
}
