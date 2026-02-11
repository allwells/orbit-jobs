import { Client } from "pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

/**
 * Migration: Add AI-related columns to job table
 */
async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("❌ Error: DATABASE_URL is not set in .env.local");
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    console.log("🔗 Connected to database.");

    // Add ai_thread (JSONB) for thread tweets
    await client.query(`
      ALTER TABLE job 
      ADD COLUMN IF NOT EXISTS ai_thread JSONB DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS ai_analysis TEXT;
    `);

    console.log("✅ Added ai_thread and ai_analysis columns to job table.");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await client.end();
  }
}

migrate();
