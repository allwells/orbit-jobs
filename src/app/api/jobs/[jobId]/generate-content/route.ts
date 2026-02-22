import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/kysely";
import { generateJobThread } from "@/lib/content-generator";
import { activityLogger } from "@/lib/activity-logger";
import type { Job } from "@/types/job";
import { AIProvider, AIModel } from "@/lib/ai";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const { jobId } = await params;
    const { provider, model, userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Fetch job from database using Kysely to bypass RLS issues in API context
    const job = await db
      .selectFrom("jobs")
      .selectAll()
      .where("id", "=", jobId)
      .executeTakeFirst();

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Generate content
    const result = await generateJobThread(
      job as Job,
      provider as AIProvider,
      model as AIModel,
    );

    // Update job record using Kysely
    await db
      .updateTable("jobs")
      .set({
        ai_content_generated: true,
        ai_thread_primary: result.content.primaryTweet,
        ai_thread_reply: result.content.replyTweet,
        ai_model_used: result.modelUsed,
        updated_at: new Date().toISOString(),
      })
      .where("id", "=", jobId)
      .execute();

    // Log activity
    await activityLogger.logContentGenerated(userId, {
      jobId, // passed inside metadata
      modelUsed: result.modelUsed,
      tokensUsed: result.tokensUsed || 0,
      generationTime: result.generationTime,
    });

    return NextResponse.json({
      success: true,
      content: result.content,
      tokensUsed: result.tokensUsed,
    });
  } catch (error) {
    console.error("Content generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 },
    );
  }
}
