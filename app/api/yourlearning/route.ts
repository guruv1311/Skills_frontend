// app/api/yourlearning/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { fetchYourLearningWithBadges } from "@/app/consultant/services/yourLearningService";

// NOTE: adjust AUTH_COOKIE_NAME if yours differs
const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "auth_token";

export async function GET(req: NextRequest) {
  try {
    // Bypass cookie check and use hardcoded token
    const token = process.env.YOURLEARNING_BEARER_TOKEN;

    if (!token) {
      console.error("YOURLEARNING_BEARER_TOKEN is not set in .env");
      return NextResponse.json(
        { error: "Server configuration error: Missing API token" },
        { status: 500 }
      );
    }
    const parts = token.split('.');
    if (parts.length !== 3) {
      return NextResponse.json({ error: "Invalid hardcoded token format" }, { status: 500 });
    }
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

    const talentID = payload.id || payload.sub;

    if (!talentID) {
      return NextResponse.json(
        { error: "Talent ID not found in hardcoded token" },
        { status: 400 }
      );
    }

    console.log(`Fetching YourLearning data for talentID: ${talentID} using hardcoded token`);

  

    const yourLearningData = await fetchYourLearningWithBadges(
      String(talentID)
    );

    return NextResponse.json(
      { ok: true, data: yourLearningData },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("api/yourlearning error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to fetch YourLearning data" },
      { status: 500 }
    );
  }
}
