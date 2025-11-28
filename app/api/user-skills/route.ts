import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/config";

export async function POST(req: NextRequest) {
    try {
        const cookies = req.cookies;
        const cookieHeader = cookies.getAll()
            .map(cookie => `${cookie.name}=${cookie.value}`)
            .join('; ');

        const body = await req.json();
        const backendUrl = `${API_URL}/api/user-skills/`;

        const res = await fetch(backendUrl, {
            method: "POST",
            headers: {
                Cookie: cookieHeader,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
            cache: "no-store",
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.error("User skills submission failed:", res.status, errorData);
            return NextResponse.json(errorData, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data, { status: 201 });
    } catch (err) {
        console.error("User skills proxy error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
