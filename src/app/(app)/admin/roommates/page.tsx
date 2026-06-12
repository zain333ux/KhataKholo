import { redirect } from "next/navigation";

import { AdminRoommatesPanel } from "@/components/auth/admin-roommates-panel";
import { requireCurrentRoommate } from "@/lib/auth/session";
import { getRoommatesForGroup } from "@/lib/queries/roommates";

export default async function AdminRoommatesPage() {
  const roommate = await requireCurrentRoommate();

  if (roommate.role !== "admin") {
    redirect("/profile");
  }

  const roommates = await getRoommatesForGroup(roommate.group_id);

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-sm font-semibold text-emerald-700">Admin</p>
        <h2 className="text-2xl font-bold text-slate-950">Roommates</h2>
        <p className="text-sm text-slate-500">Add, edit, remove, or reset PINs for this room.</p>
      </div>
      <AdminRoommatesPanel roommates={roommates} />
    </div>
  );
}

