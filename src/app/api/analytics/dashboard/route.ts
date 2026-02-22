import { NextResponse } from "next/server";
import { getDashboardOverview } from "@/lib/analytics-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getDashboardOverview();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching dashboard overview:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard overview" },
      { status: 500 },
    );
  }
}
