import { NextResponse } from "next/server";

export async function GET() {
  const data = { percentage: 51 };

  return NextResponse.json(data);
}
