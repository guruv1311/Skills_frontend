// lib/server/getBearerToken.ts
// This file is safe because it is NEVER imported by a file marked "use client".
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export async function getBearerTokenFromSession(): Promise<string | null> {
  // Use await for robustness against environment variations
  const cookieStore = await cookies();

  const authToken = cookieStore.get(
    process.env.AUTH_COOKIE_NAME || "session"
  )?.value;

  if (!authToken) {
    return null;
  }

  const payload = verifyToken(authToken);

  const rawAccessToken = (payload as any)?.profile?.accessToken as
    | string
    | undefined;

  if (rawAccessToken) {
    return rawAccessToken.startsWith("Bearer ")
      ? rawAccessToken
      : `Bearer ${rawAccessToken}`;
  }

  return null;
}
