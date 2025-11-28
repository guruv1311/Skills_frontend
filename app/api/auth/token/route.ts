import { NextRequest, NextResponse } from "next/server";
import { getBearerTokenFromSession } from "@/lib/server/getBearerToken";

export async function GET(req: NextRequest) {
    try {
        const bearerToken = await getBearerTokenFromSession();

        if (!bearerToken) {
            // Return 401 if the token is not found or invalid
            return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Return the token as JSON
        return NextResponse.json({ token: bearerToken });
    } catch (error) {
        console.error("Token endpoint failed:", error);
        return new NextResponse(
            JSON.stringify({ error: "Internal Server Error during token retrieval" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}