import {
  Bell,
  CheckCircle2,
  History,
  ReceiptText,
} from "lucide-react";

import Link from "next/link";

import { Badge, Card, EmptyState } from "@/components/ui/card";
import { formatRupees } from "@/lib/money";
import { getHistoryEvents } from "@/lib/queries/history";

const eventConfig = {
  expense:  { tone: "green",  icon: ReceiptText, label: "Expense" },
  payment:  { tone: "blue",   icon: CheckCircle2, label: "Payment" },
  dispute:  { tone: "rose",   icon: Bell, label: "Dispute" },
  reminder: { tone: "slate",  icon: Bell, label: "Reminder" },
} as const;

// Group events by date string
function groupByDate(events: Awaited<ReturnType<typeof getHistoryEvents>>) {
  const map = new Map<string, typeof events>();
  for (const ev of events) {
    const rawDate = ev.createdAt ? new Date(ev.createdAt).toLocaleDateString("en-PK", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }) : "Unknown date";
    if (!map.has(rawDate)) map.set(rawDate, []);
    map.get(rawDate)!.push(ev);
  }
  return map;
}


export default async function HistoryPage() {
  const events = await getHistoryEvents();
  const grouped = groupByDate(events);

  return (
    <div className="grid gap-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
          Room Activity
        </p>
        <h2 className="text-xl font-extrabold text-slate-900">History</h2>
        <p className="mt-1 text-xs text-slate-500">
          Expenses, payments, disputes, and reminders involving you.
        </p>
      </div>

      {events.length === 0 ? (
        <EmptyState
          title="No history yet"
          body="Your private activity will appear here after expenses or payments."
          icon={<History size={22} />}
        />
      ) : (
        <div className="grid gap-5">
          {Array.from(grouped.entries()).map(([date, dateEvents]) => (
            <div key={date} className="grid gap-2">
              {/* Date header */}
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{date}</p>
              <div className="grid gap-2">
                {dateEvents.map((event) => {
                  const cfg = eventConfig[event.type];
                  const Icon = cfg.icon;

                  const card = (
                    <Card key={`${event.type}-${event.id}`} className="flex items-center gap-3 p-4">
                      <span
                        className={[
                          "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
                          event.type === "expense"  ? "bg-emerald-100" :
                          event.type === "payment"  ? "bg-sky-100" :
                          event.type === "dispute"  ? "bg-rose-100" :
                          "bg-slate-100",
                        ].join(" ")}
                      >
                        <Icon
                          size={18}
                          className={
                            event.type === "expense"  ? "text-emerald-600" :
                            event.type === "payment"  ? "text-sky-600" :
                            event.type === "dispute"  ? "text-rose-600" :
                            "text-slate-500"
                          }
                        />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {event.title}
                          </p>
                          <Badge tone={cfg.tone}>{event.status ?? cfg.label}</Badge>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-slate-500">{event.body}</p>
                      </div>
                      {event.amountPaisa !== null ? (
                        <p className="shrink-0 font-bold text-slate-900">
                          {formatRupees(event.amountPaisa)}
                        </p>
                      ) : null}
                    </Card>
                  );

                  return event.href ? (
                    <Link key={`${event.type}-${event.id}`} href={event.href} className="hover:opacity-90 transition-opacity">
                      {card}
                    </Link>
                  ) : (
                    <div key={`${event.type}-${event.id}`}>{card}</div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
