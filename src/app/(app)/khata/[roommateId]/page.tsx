import Link from "next/link";

import { Badge, Card, EmptyState } from "@/components/ui/card";
import { formatRupees } from "@/lib/money";
import { getPrivatePairHistory } from "@/lib/queries/khata";

export default async function PairHistoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ roommateId: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { roommateId } = await params;
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams.page ?? "1");
  const limit = 20;
  const history = await getPrivatePairHistory(roommateId, page, limit);
  const hasNextPage = history.events.length === limit;

  return (
    <div className="grid gap-4">
      <div>
        <Link
          href="/khata"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:underline touch-manipulation"
        >
          Back to My Khata
        </Link>
        <p className="text-sm font-semibold text-emerald-700 mt-2">Private pair</p>
        <h2 className="text-2xl font-bold text-slate-950">{history.otherRoommate.name}</h2>
        <p className="text-sm text-slate-500">Only you and this roommate can see this private khata.</p>
      </div>

      <Card className="grid gap-2">
        <p className="text-sm text-slate-500">Current balance</p>
        {history.balance ? (
          <>
            <p className="text-3xl font-bold text-slate-950">{formatRupees(history.balance.amountPaisa)}</p>
            <Badge tone={history.balance.direction === "i_owe" ? "rose" : "green"}>
              {history.balance.direction === "i_owe" ? "You owe" : "Owes you"}
            </Badge>
          </>
        ) : (
          <p className="text-lg font-bold text-slate-950">No pending balance</p>
        )}
      </Card>

      <section className="grid gap-3">
        <h3 className="text-lg font-bold text-slate-950">Pair history</h3>
        {history.events.length === 0 ? (
          <EmptyState title="No pair history" body="Payments, reminders, and pair expenses will appear here." />
        ) : (
          <>
            <div className="grid gap-3">
              {history.events.map((event) => (
                <Card key={`${event.type}-${event.id}`} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{event.title}</p>
                    <p className="text-sm text-slate-500">{event.body}</p>
                  </div>
                  <p className="font-bold text-slate-950">{formatRupees(event.amountPaisa)}</p>
                </Card>
              ))}
            </div>

            {/* Pagination controls */}
            <div className="flex items-center justify-between gap-4 mt-6">
              {page > 1 ? (
                <Link
                  href={`/khata/${roommateId}?page=${page - 1}`}
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 active:scale-95 touch-manipulation"
                >
                  ← Previous
                </Link>
              ) : (
                <div className="flex-1" />
              )}
              <span className="text-sm font-semibold text-slate-500">Page {page}</span>
              {hasNextPage ? (
                <Link
                  href={`/khata/${roommateId}?page=${page + 1}`}
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 active:scale-95 touch-manipulation"
                >
                  Next →
                </Link>
              ) : (
                <div className="flex-1" />
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

