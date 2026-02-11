import { NextResponse } from "next/server";
import { postToTwitter, getRemainingPosts } from "@/lib/twitter";

export async function POST(req: Request) {
  try {
    const { jobId, content } = await req.json();

    if (!jobId || !content) {
      return NextResponse.json(
        { error: "jobId and content are required" },
        { status: 400 },
      );
    }

    const result = await postToTwitter(content, jobId);

    if (result.success) {
      const remaining = await getRemainingPosts();
      return NextResponse.json({
        success: true,
        tweetId: result.tweetId,
        remainingPosts: remaining,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error("Post to Twitter failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to post to Twitter",
      },
      { status: 500 },
    );
  }
}
