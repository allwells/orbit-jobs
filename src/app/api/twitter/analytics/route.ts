import { NextResponse } from "next/server";
import { getTwitterAnalytics } from "@/lib/twitter";

export async function GET() {
  try {
    const analytics = await getTwitterAnalytics();
    return NextResponse.json(analytics);
  } catch (error: any) {
    console.error("Failed to fetch Twitter analytics:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
