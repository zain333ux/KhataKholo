import { NextResponse } from "next/server";

import { getCurrentRoommate } from "@/lib/auth/session";
import { createCloudinaryUploadSignature } from "@/lib/cloudinary";

export async function POST() {
  const roommate = await getCurrentRoommate();

  if (!roommate) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const signature = createCloudinaryUploadSignature();

  if (!signature) {
    return NextResponse.json({ error: "Cloudinary is not configured." }, { status: 500 });
  }

  return NextResponse.json(signature);
}

