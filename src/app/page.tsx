import { redirect } from "next/navigation";

import { getCurrentRoommate } from "@/lib/auth/session";

export default async function RootPage() {
  const roommate = await getCurrentRoommate();

  if (roommate) {
    redirect("/home");
  }

  redirect("/login");
}

