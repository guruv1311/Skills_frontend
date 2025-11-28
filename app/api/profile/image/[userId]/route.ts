import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/config";

const PROFILE_IMAGE_BASE = "https://w3-unified-profile-api.ibm.com/v3/image";

// Define the handler function, accepting params
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  try {
    // 1. Get access token from backend using cookies
    const cookies = req.cookies;
    const cookieHeader = cookies.getAll()
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');

    const authRes = await fetch(`${API_URL}/auth/user`, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!authRes.ok) {
      console.warn("Profile image proxy: Backend auth check failed");
      return new NextResponse(null, { status: 401 });
    }

    const authData = await authRes.json();
    const accessToken = authData.access_token;

    if (!accessToken) {
      console.warn("Profile image proxy: No access token returned from backend");
      return new NextResponse(null, { status: 401 });
    }

    // 2. Fetch image from W3 API using the token
    // Use userId as the email/id for the profile image API
    const url = `${PROFILE_IMAGE_BASE}/${encodeURIComponent(userId)}`;

    const upstreamRes = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!upstreamRes.ok) {
      console.warn(`Profile image API ${upstreamRes.status} for ${userId}`);
      // Return 404/204 to allow the client to display initials
      return new NextResponse(null, { status: 404 });
    }

    const contentType = upstreamRes.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await upstreamRes.arrayBuffer();

    // Return raw image bytes with caching headers
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    console.error("profile image proxy error:", err);
    return new NextResponse(null, { status: 500 });
  }
}
