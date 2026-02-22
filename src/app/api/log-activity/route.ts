import { NextRequest, NextResponse } from "next/server";
import { logActivityServer } from "@/lib/activity-logger";
import { ActivityType } from "@/types/activity";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, activityType, title, description, metadata } = body;

    if (!userId || !activityType || !title || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await logActivityServer({
      userId,
      activityType: activityType as ActivityType,
      title,
      description,
      metadata,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in log-activity route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
