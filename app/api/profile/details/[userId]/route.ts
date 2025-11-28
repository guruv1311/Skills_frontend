import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/config";

const PROFILE_API_BASE = "https://w3-unified-profile-api.ibm.com/v3/profiles";

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
            console.warn("Profile details proxy: Backend auth check failed");
            return new NextResponse(null, { status: 401 });
        }

        const authData = await authRes.json();
        const accessToken = authData.access_token;

        if (!accessToken) {
            console.warn("Profile details proxy: No access token returned from backend");
            return new NextResponse(null, { status: 401 });
        }

        // 2. Fetch profile from W3 API using the token
        const url = `${PROFILE_API_BASE}/${encodeURIComponent(userId)}/profile_combined`;

        const upstreamRes = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/json",
            },
            cache: "no-store",
        });

        if (!upstreamRes.ok) {
            console.warn(`Profile details API ${upstreamRes.status} for ${userId}`);
            return new NextResponse(null, { status: upstreamRes.status });
        }

        const profileRaw = await upstreamRes.json();

        // 3. Map the data
        const nameContent = profileRaw?.content?.identity_info?.content?.name;
        const mappedData = {
            userId: profileRaw?.userId || profileRaw?.key || userId,
            name: (nameContent?.first || "") + " " + (nameContent?.last || ""),
            phone: profileRaw?.content?.identity_info?.content?.telephone?.mobile || null,
            manager: profileRaw?.content?.identity_info?.content?.functionalManager?.nameDisplay || null,
            unit: profileRaw?.content?.identity_info?.content?.org?.title || null,
            email: profileRaw?.content?.identity_info?.content?.emailAddress || profileRaw?.content?.identity_info?.content?.email || null,
        };

        return NextResponse.json(mappedData, { status: 200 });

    } catch (err) {
        console.error("profile details proxy error:", err);
        return new NextResponse(null, { status: 500 });
    }
}
