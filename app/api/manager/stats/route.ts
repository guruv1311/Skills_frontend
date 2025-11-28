import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/config";

export async function GET(req: NextRequest) {
    try {
        const cookies = req.cookies;
        const cookieHeader = cookies.getAll()
            .map(cookie => `${cookie.name}=${cookie.value}`)
            .join('; ');

        const authRes = await fetch(`${API_URL}/auth/user`, {
            headers: { Cookie: cookieHeader },
            cache: "no-store",
        });

        if (!authRes.ok) return new NextResponse(null, { status: 401 });

        const authData = await authRes.json();
        const accessToken = authData.access_token;

        let managerId = authData.user?.user_id;
        if (!managerId && authData.user?.identities?.[0]?.idpUserInfo?.attributes?.uid) {
            managerId = authData.user.identities[0].idpUserInfo.attributes.uid;
        }
        if (!managerId) managerId = authData.user?.email || authData.user?.sub;

        if (!accessToken || !managerId) return new NextResponse(null, { status: 401 });

        const backendUrl = `${API_URL}/api/team/manager/${encodeURIComponent(managerId)}/reportees/summary`;
        console.log(`[Proxy] Fetching stats from: ${backendUrl}`);

        const backendRes = await fetch(backendUrl, {
            headers: { Cookie: cookieHeader, Accept: "application/json" },
            cache: "no-store",
        });

        if (!backendRes.ok) {
            console.warn(`Backend stats fetch failed: ${backendRes.status}`);
            return new NextResponse(null, { status: backendRes.status });
        }

        const data = await backendRes.json();
        return NextResponse.json(data, { status: 200 });

    } catch (err) {
        console.error("Manager stats proxy error:", err);
        return new NextResponse(null, { status: 500 });
    }
}
