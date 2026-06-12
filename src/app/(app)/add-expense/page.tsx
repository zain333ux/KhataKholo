import { AddExpenseForm } from "@/components/expense/add-expense-form";
import { requireCurrentRoommate } from "@/lib/auth/session";
import { getActiveRoommatesForGroup } from "@/lib/queries/roommates";

export default async function AddExpensePage() {
  const current = await requireCurrentRoommate();
  const roommates = await getActiveRoommatesForGroup(current.group_id);

  return (
    <div className="grid gap-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">New Expense</p>
        <h2 className="text-xl font-extrabold text-slate-900">Add Shared Kharcha</h2>
        <p className="mt-1 text-xs text-slate-500">
          Choose who was included and how the bill should split.
        </p>
      </div>
      <AddExpenseForm roommates={roommates} currentRoommateId={current.id} />
    </div>
  );
}
