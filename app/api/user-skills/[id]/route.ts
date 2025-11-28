import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/config";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const cookies = req.cookies;
        const cookieHeader = cookies.getAll()
            .map(cookie => `${cookie.name}=${cookie.value}`)
            .join('; ');

        const body = await req.json();
        const backendUrl = `${API_URL}/api/user-skills/${id}`;
        console.log(`[Proxy] Updating user skill: ${backendUrl}`, body);

        const backendRes = await fetch(backendUrl, {
            method: "PUT",
            headers: {
                Cookie: cookieHeader,
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: JSON.stringify(body),
            cache: "no-store",
        });

        if (!backendRes.ok) {
            console.warn(`Backend update failed: ${backendRes.status}`);
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json(errorData, { status: backendRes.status });
        }

        const data = await backendRes.json();
        return NextResponse.json(data, { status: 200 });

    } catch (err) {
        console.error("User skill update proxy error:", err);
        return new NextResponse(null, { status: 500 });
    }
}
