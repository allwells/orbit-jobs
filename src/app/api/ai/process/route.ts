import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { generateJobContent } from "@/lib/gemini";
import { Job } from "@/types/database";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id, limit = 5 } = body;

    const client = await pool.connect();

    try {
      let jobs: Job[] = [];

      if (id) {
        // Fetch specific job
        const result = await client.query("SELECT * FROM job WHERE id = $1", [
          id,
        ]);
        jobs = result.rows;
      } else {
        // Fetch batch of pending jobs
        const result = await client.query(
          "SELECT * FROM job WHERE status = 'pending' ORDER BY created_at DESC LIMIT $1",
          [Math.min(limit, 10)],
        );
        jobs = result.rows;
      }

      // Fetch AI model setting
      const settingsResult = await client.query(
        "SELECT value FROM setting WHERE key = 'gemini_model'",
      );
      const modelName =
        settingsResult.rows.length > 0
          ? settingsResult.rows[0].value
          : "gemini-2.0-flash-exp";

      const results = {
        processed: 0,
        failed: 0,
        errors: [] as string[],
      };

      for (const job of jobs) {
        try {
          // Detect work mode if missing (heuristic fallback)
          if (!job.work_mode) {
            const lower = (job.location || "").toLowerCase();
            if (lower.includes("remote")) job.work_mode = "remote";
            else if (lower.includes("hybrid")) job.work_mode = "hybrid";
            else job.work_mode = "on-site";
          }

          // Generate AI content
          const content = await generateJobContent(job, modelName);

          // Update DB - mark status as 'draft'
          await client.query(
            `UPDATE job 
             SET 
               ai_hook = $1, 
               ai_thread = $2, 
               ai_reply = $3, 
               ai_analysis = $4,
               status = 'draft',
               updated_at = NOW()
             WHERE id = $5`,
            [
              content.hook,
              JSON.stringify(content.thread), // specific JSON storage
              content.reply,
              content.analysis,
              job.id,
            ],
          );

          // Log success
          await client.query(
            `INSERT INTO log (id, type, message, metadata) VALUES ($1, $2, $3, $4)`,
            [
              crypto.randomUUID(),
              "ai_generate",
              `Generated AI content for job: ${job.title}`,
              JSON.stringify({ jobId: job.id, content }),
            ],
          );

          results.processed++;
        } catch (err: any) {
          console.error(`Failed to process job ${job.id}:`, err);
          results.failed++;
          results.errors.push(`Job ${job.id}: ${err.message}`);

          // Log error
          await client.query(
            `INSERT INTO log (id, type, message, metadata) VALUES ($1, $2, $3, $4)`,
            [
              crypto.randomUUID(),
              "error",
              `AI Generation failed for job: ${job.title}`,
              JSON.stringify({ jobId: job.id, error: err.message }),
            ],
          );

          // CRITICAL: Stop processing if we hit a hard failure (like Rate Limit or Auth)
          // or if the user requested to cancel on failure.
          // For now, we break on 429 (Rate Limit) or 401/403 (Auth) or 404 (Model not found)
          const msg = err.message || "";
          if (
            msg.includes("Rate limit") ||
            msg.includes("API Key") ||
            msg.includes("Model Not Found")
          ) {
            console.warn("Stopping batch processing due to critical AI error");
            break;
          }
        }
      }

      return NextResponse.json({
        success: results.processed > 0,
        message: `Processed ${results.processed} jobs. Failed: ${results.failed}`,
        details: results,
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
