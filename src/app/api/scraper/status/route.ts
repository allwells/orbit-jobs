import { NextResponse } from "next/server";
import { Client } from "pg";

/** GET /api/scraper/status — latest scraper run info */
export async function GET() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    // Get the latest scrape log
    const lastRun = await client.query(
      `SELECT message, metadata, created_at
       FROM log
       WHERE type = 'scrape'
       ORDER BY created_at DESC
       LIMIT 1`,
    );

    // Get total jobs count
    const totalJobs = await client.query("SELECT COUNT(*) as count FROM job");

    // Get pending jobs count
    const pendingJobs = await client.query(
      "SELECT COUNT(*) as count FROM job WHERE status = 'pending'",
    );

    // Get latest error if any
    const lastError = await client.query(
      `SELECT message, created_at
       FROM log
       WHERE type = 'error'
       ORDER BY created_at DESC
       LIMIT 1`,
    );

    return NextResponse.json({
      lastRun: lastRun.rows[0] ?? null,
      totalJobs: parseInt(totalJobs.rows[0]?.count ?? "0"),
      pendingJobs: parseInt(pendingJobs.rows[0]?.count ?? "0"),
      lastError: lastError.rows[0] ?? null,
    });
  } catch (error) {
    console.error("Failed to fetch scraper status:", error);
    return NextResponse.json(
      { error: "Failed to fetch status" },
      { status: 500 },
    );
  } finally {
    await client.end();
  }
}
