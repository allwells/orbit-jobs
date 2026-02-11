import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, ai_hook, ai_reply, ai_thread, ai_analysis } = body;

    const client = await pool.connect();
    try {
      // Dynamic update query
      let query = "UPDATE job SET updated_at = NOW()";
      const values: any[] = [id];
      let paramIndex = 2; // $1 is id

      if (status) {
        query += `, status = $${paramIndex++}`;
        values.push(status);
      }
      if (ai_hook !== undefined) {
        query += `, ai_hook = $${paramIndex++}`;
        values.push(ai_hook);
      }
      if (ai_reply !== undefined) {
        query += `, ai_reply = $${paramIndex++}`;
        values.push(ai_reply);
      }
      if (ai_thread !== undefined) {
        query += `, ai_thread = $${paramIndex++}`;
        values.push(JSON.stringify(ai_thread)); // ensure JSON for JSONB
      }
      if (ai_analysis !== undefined) {
        query += `, ai_analysis = $${paramIndex++}`;
        values.push(ai_analysis);
      }

      query += ` WHERE id = $1 RETURNING *`;

      const result = await client.query(query, values);

      if (result.rowCount === 0) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Failed to update job:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const client = await pool.connect();
    try {
      const result = await client.query(
        "DELETE FROM job WHERE id = $1 RETURNING id",
        [id],
      );

      if (result.rowCount === 0) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, id });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Failed to delete job:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
