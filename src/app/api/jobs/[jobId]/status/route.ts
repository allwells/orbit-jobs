import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/kysely";
import { activityLogger } from "@/lib/activity-logger";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const { jobId } = await params;
    const body = await request.json();
    const { status, userId } = body;

    // Validate status
    const validStatuses = ["pending", "approved", "rejected", "posted"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Fetch current job using Kysely to bypass RLS
    const job = await db
      .selectFrom("jobs")
      .selectAll()
      .where("id", "=", jobId)
      .executeTakeFirst();

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Update status
    await db
      .updateTable("jobs")
      .set({
        status,
        updated_at: new Date().toISOString(),
      })
      .where("id", "=", jobId)
      .execute();

    // Log activity
    if (status === "approved") {
      await activityLogger.logJobApproved(userId, jobId, job.title);
    } else if (status === "rejected") {
      await activityLogger.logJobRejected(userId, jobId, job.title);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating job status:", error);
    return NextResponse.json(
      { error: "Failed to update job status" },
      { status: 500 },
    );
  }
}
