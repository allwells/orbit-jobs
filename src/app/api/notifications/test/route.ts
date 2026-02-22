import { NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST() {
  try {
    await sendTelegramMessage({
      text: "✅ *Test Notification*\n\nYour OrbitJobs Telegram notifications are working correctly!",
      parseMode: "Markdown",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Test notification failed:", error);
    return NextResponse.json(
      { error: "Failed to send test notification" },
      { status: 500 },
    );
  }
}
