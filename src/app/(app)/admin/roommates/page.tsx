import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

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
    <div className="grid gap-5">
      <div>
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:underline"
        >
          <ArrowLeft size={15} />
          Back to Profile
        </Link>
        <p className="mt-3 text-xs font-bold uppercase tracking-widest text-emerald-600">Admin</p>
        <h2 className="text-xl font-extrabold text-slate-900">Manage Roommates</h2>
        <p className="mt-1 text-xs text-slate-500">
          Add, edit, remove, or reset PINs for this room.
        </p>
      </div>
      <AdminRoommatesPanel roommates={roommates} />
    </div>
  );
}
