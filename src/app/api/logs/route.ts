import { NextResponse } from "next/server";
import pool from "@/lib/db";

/** GET /api/logs — fetch recent activity logs */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!process.env.DATABASE_URL) {
      // Mock logs
      return NextResponse.json({
        logs: [
          {
            id: "1",
            type: "scrape",
            message: "Scraped 15 new jobs",
            created_at: new Date().toISOString(),
          },
          {
            id: "2",
            type: "ai_generate",
            message: "Generated AI drafts for 5 jobs",
            created_at: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: "3",
            type: "scrape",
            message: "Scheduled scrape completed",
            created_at: new Date(Date.now() - 7200000).toISOString(),
          },
        ],
        count: 3,
      });
    }

    const client = await pool.connect();

    try {
      const result = await client.query(
        `SELECT id, type, message, created_at, metadata
         FROM log
         ORDER BY created_at DESC
         LIMIT $1`,
        [Math.min(limit, 50)], // Cap at 50
      );

      return NextResponse.json({
        logs: result.rows,
        count: result.rows.length,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Failed to fetch logs:", error);
    // Mock logs on error
    return NextResponse.json({
      logs: [
        {
          id: "1",
          type: "scrape",
          message: "Scraped 15 new jobs",
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          type: "ai_generate",
          message: "Generated AI drafts for 5 jobs",
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "3",
          type: "scrape",
          message: "Scheduled scrape completed",
          created_at: new Date(Date.now() - 7200000).toISOString(),
        },
      ],
      count: 3,
    });
  }
}
