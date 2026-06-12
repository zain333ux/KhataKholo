import Link from "next/link";

import { Badge, Card, EmptyState } from "@/components/ui/card";
import { formatRupees } from "@/lib/money";
import { getPrivatePairHistory } from "@/lib/queries/khata";

export default async function PairHistoryPage({ params }: { params: Promise<{ roommateId: string }> }) {
  const { roommateId } = await params;
  const history = await getPrivatePairHistory(roommateId);

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-sm font-semibold text-emerald-700">Private pair</p>
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
          history.events.map((event) => (
            <Card key={`${event.type}-${event.id}`} className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-950">{event.title}</p>
                <p className="text-sm text-slate-500">{event.body}</p>
              </div>
              <p className="font-bold text-slate-950">{formatRupees(event.amountPaisa)}</p>
            </Card>
          ))
        )}
      </section>

      <Link href="/khata" className="text-center text-sm font-semibold text-emerald-700">
        Back to My Khata
      </Link>
    </div>
  );
}

