import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Atlas AI API is alive",
    owner: "Nganga Makumi",
    timestamp: Date.now(),
  });
}
