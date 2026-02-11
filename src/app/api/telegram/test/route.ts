import { NextResponse } from "next/server";
import { sendTestNotification } from "@/lib/telegram";

export async function POST(req: Request) {
  try {
    const { chatId } = await req.json();

    if (!chatId) {
      return NextResponse.json(
        { error: "Chat ID is required" },
        { status: 400 },
      );
    }

    await sendTestNotification(chatId);

    return NextResponse.json({
      success: true,
      message: "Test notification sent successfully",
    });
  } catch (error: any) {
    console.error("Test notification failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to send test notification",
      },
      { status: 500 },
    );
  }
}
