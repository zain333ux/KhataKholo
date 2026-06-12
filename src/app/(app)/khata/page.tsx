import { Lock, ReceiptText } from "lucide-react";

import { KhataCard } from "@/components/khata/khata-card";
import { EmptyState } from "@/components/ui/card";
import { getMyKhata } from "@/lib/queries/khata";

export default async function KhataPage() {
  const khata = await getMyKhata();

  return (
    <div className="grid gap-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
          Private Balances
        </p>
        <h2 className="text-xl font-extrabold text-slate-900">My Khata</h2>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <Lock size={11} />
          <span>Only balances involving you are visible here.</span>
        </div>
      </div>

      {khata.length === 0 ? (
        <EmptyState
          title="No pending balance"
          body="Your private khata is all clear. You're settled up with everyone!"
          icon={<ReceiptText size={22} />}
        />
      ) : (
        <div className="grid gap-4">
          {khata.map((item) => (
            <KhataCard key={item.balance.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
