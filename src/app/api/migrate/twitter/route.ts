import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST() {
  const client = await pool.connect();
  try {
    console.log("🔄 Creating twitter_post table...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS twitter_post (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        job_id UUID REFERENCES job(id) ON DELETE CASCADE,
        tweet_id TEXT,
        posted_at TIMESTAMP DEFAULT NOW(),
        status TEXT DEFAULT 'success',
        error_message TEXT
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_twitter_post_posted_at ON twitter_post(posted_at);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_twitter_post_job_id ON twitter_post(job_id);
    `);

    console.log("✅ twitter_post table created successfully");

    return NextResponse.json({
      success: true,
      message: "twitter_post table created successfully",
    });
  } catch (error: any) {
    console.error("❌ Migration failed:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
