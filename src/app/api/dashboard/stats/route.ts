import { NextResponse } from "next/server";
import pool from "@/lib/db";

/** GET /api/dashboard/stats — aggregated dashboard statistics */
export async function GET() {
  try {
    const client = await pool.connect();

    try {
      // Job counts by status
      const jobStats = await client.query(`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'pending') as pending,
          COUNT(*) FILTER (WHERE status = 'draft') as draft,
          COUNT(*) FILTER (WHERE status = 'approved') as approved,
          COUNT(*) FILTER (WHERE status = 'posted') as posted,
          COUNT(*) FILTER (WHERE status = 'rejected') as rejected
        FROM job
      `);

      // Latest scrape run
      const lastScrape = await client.query(
        `SELECT created_at, metadata
         FROM log
         WHERE type = 'scrape'
         ORDER BY created_at DESC
         LIMIT 1`,
      );

      // Check if keywords are configured
      const keywords = await client.query(
        "SELECT value FROM setting WHERE key = 'scraper_keywords'",
      );

      const stats = jobStats.rows[0];

      return NextResponse.json({
        totalJobs: parseInt(stats?.total ?? "0"),
        pendingJobs: parseInt(stats?.pending ?? "0"),
        draftJobs: parseInt(stats?.draft ?? "0"),
        approvedJobs: parseInt(stats?.approved ?? "0"),
        postedJobs: parseInt(stats?.posted ?? "0"),
        rejectedJobs: parseInt(stats?.rejected ?? "0"),
        lastScrape: lastScrape.rows[0] ?? null,
        hasKeywords: keywords.rows.length > 0,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
