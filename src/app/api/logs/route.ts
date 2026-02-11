import { NextResponse } from "next/server";
import pool from "@/lib/db";

/** GET /api/logs — fetch recent activity logs */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");

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
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 },
    );
  }
}
