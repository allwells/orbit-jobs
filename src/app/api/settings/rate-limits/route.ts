import { NextResponse } from "next/server";
import { getRateLimitStatus } from "@/lib/x-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rateLimits = await getRateLimitStatus();
    return NextResponse.json(rateLimits);
  } catch (error) {
    console.error("Failed to fetch rate limits:", error);

    if (
      error instanceof Error &&
      error.message === "Missing X API credentials"
    ) {
      return NextResponse.json(
        { error: "X API not configured" },
        { status: 503 }, // Service Unavailable (misconfigured)
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch rate limits" },
      { status: 500 },
    );
  }
}
