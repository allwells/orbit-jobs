import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/kysely";
import { postThread } from "@/lib/x-api";
import { activityLogger } from "@/lib/activity-logger";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const { jobId } = await params;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Fetch job using Kysely
    const job = await db
      .selectFrom("jobs")
      .selectAll()
      .where("id", "=", jobId)
      .executeTakeFirst();

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Validate job has content
    if (!job.ai_thread_primary || !job.ai_thread_reply) {
      return NextResponse.json(
        { error: "No content generated for this job" },
        { status: 400 },
      );
    }

    // Validate job is approved
    if (job.status !== "approved" && job.status !== "posted") {
      return NextResponse.json(
        { error: "Job must be approved before posting" },
        { status: 400 },
      );
    }

    if (job.status === "posted") {
      return NextResponse.json(
        { error: "Job already posted" },
        { status: 400 },
      );
    }

    // Post to X
    const { primaryTweetId, replyTweetId } = await postThread(
      job.ai_thread_primary,
      job.ai_thread_reply,
    );

    // Update job record using Kysely
    await db
      .updateTable("jobs")
      .set({
        status: "posted",
        posted_to_x: true,
        posted_at: new Date().toISOString(),
        x_tweet_id: primaryTweetId,
        updated_at: new Date().toISOString(),
      })
      .where("id", "=", jobId)
      .execute();

    // Log activity
    await activityLogger.logJobPosted(userId, {
      jobId: jobId,
      tweetId: primaryTweetId,
    });

    return NextResponse.json({
      success: true,
      tweetUrl: `https://twitter.com/TheOrbitJobs/status/${primaryTweetId}`,
      primaryTweetId,
      replyTweetId,
    });
  } catch (error) {
    console.error("Failed to post to X:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to post" },
      { status: 500 },
    );
  }
}
