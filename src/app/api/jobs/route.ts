import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    const client = await pool.connect();
    try {
      let query = "SELECT * FROM job";
      const params: any[] = [];

      if (status) {
        query += " WHERE status = $1";
        params.push(status);
      }

      query += ` ORDER BY created_at DESC LIMIT ${limit}`; // Safe integer limit

      const result = await client.query(query, params);

      return NextResponse.json({
        data: result.rows,
        count: result.rowCount,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
