import { AddExpenseForm } from "@/components/expense/add-expense-form";
import { requireCurrentRoommate } from "@/lib/auth/session";
import { getActiveRoommatesForGroup } from "@/lib/queries/roommates";

export default async function AddExpensePage() {
  const current = await requireCurrentRoommate();
  const roommates = await getActiveRoommatesForGroup(current.group_id);

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-sm font-semibold text-emerald-700">New expense</p>
        <h2 className="text-2xl font-bold text-slate-950">Add shared kharcha</h2>
        <p className="text-sm text-slate-500">Choose who was included and how the bill should split.</p>
      </div>
      <AddExpenseForm roommates={roommates} currentRoommateId={current.id} />
    </div>
  );
}

