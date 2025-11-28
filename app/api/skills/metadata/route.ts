import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/config";

export async function GET(req: NextRequest) {
  try {
    const cookies = req.cookies;
    const cookieHeader = cookies.getAll()
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');

    const res = await fetch(`${API_URL}/api/skills/`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch skills metadata:", res.status);
      return NextResponse.json([], { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Skills metadata proxy error:", err);
    return NextResponse.json([], { status: 500 });
  }
}
