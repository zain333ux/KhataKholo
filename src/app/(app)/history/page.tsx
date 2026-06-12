import Link from "next/link";

import { Badge, Card, EmptyState } from "@/components/ui/card";
import { formatRupees } from "@/lib/money";
import { getHistoryEvents } from "@/lib/queries/history";

const eventTone = {
  expense: "green",
  payment: "blue",
  dispute: "amber",
  reminder: "slate",
} as const;

export default async function HistoryPage() {
  const events = await getHistoryEvents();

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-sm font-semibold text-emerald-700">Room activity</p>
        <h2 className="text-2xl font-bold text-slate-950">History</h2>
        <p className="text-sm text-slate-500">Expenses, payments, disputes, and reminders involving you.</p>
      </div>
      {events.length === 0 ? (
        <EmptyState title="No history yet" body="Your private activity will appear here after expenses or payments." />
      ) : (
        events.map((event) => {
          const content = (
            <Card className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold text-slate-950">{event.title}</p>
                  <Badge tone={eventTone[event.type]}>{event.status ?? event.type}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">{event.body}</p>
              </div>
              {event.amountPaisa !== null ? (
                <p className="shrink-0 font-bold text-slate-950">{formatRupees(event.amountPaisa)}</p>
              ) : null}
            </Card>
          );

          return event.href ? (
            <Link key={`${event.type}-${event.id}`} href={event.href}>
              {content}
            </Link>
          ) : (
            <div key={`${event.type}-${event.id}`}>{content}</div>
          );
        })
      )}
    </div>
  );
}
