import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export const SESSION_COOKIE_NAME = "kk_session";
const SESSION_DAYS = 30;

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export type SessionCreateResult = {
  sessionCreated: boolean;
  cookieSet: boolean;
};

export async function createRoommateSession(roommateId: string): Promise<SessionCreateResult> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  const { error } = await supabase.from("roommate_sessions").insert({
    roommate_id: roommateId,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  return {
    sessionCreated: true,
    cookieSet: true,
  };
}

export async function clearRoommateSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const supabase = await createServerSupabaseClient();

  if (token && supabase) {
    await supabase.from("roommate_sessions").delete().eq("token_hash", hashSessionToken(token));
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionTokenHash(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return hashSessionToken(token);
}
