import { KhataCard } from "@/components/khata/khata-card";
import { EmptyState } from "@/components/ui/card";
import { getMyKhata } from "@/lib/queries/khata";

export default async function KhataPage() {
  const khata = await getMyKhata();

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-sm font-semibold text-emerald-700">Private balances</p>
        <h2 className="text-2xl font-bold text-slate-950">My Khata</h2>
        <p className="text-sm text-slate-500">Only balances involving you will appear here.</p>
      </div>
      {khata.length === 0 ? (
        <EmptyState title="No pending balance" body="Your private khata is clear for now." />
      ) : (
        khata.map((item) => <KhataCard key={item.balance.id} item={item} />)
      )}
    </div>
  );
}
