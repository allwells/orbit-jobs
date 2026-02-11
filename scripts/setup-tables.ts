import { Client } from "pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

/**
 * Setup Script: Creates the job, setting, and log tables
 * and seeds initial scraper settings.
 */
async function setup() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("❌ Error: DATABASE_URL is not set in .env.local");
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    console.log("🔗 Connected to database.");

    // ── Job Table ──────────────────────────────────
    console.log("🛠️  Creating job table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS job (
        id TEXT PRIMARY KEY,
        linkedin_job_id TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        salary TEXT,
        url TEXT NOT NULL,
        location TEXT,
        work_mode TEXT,
        ai_hook TEXT,
        ai_reply TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        posted_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // ── Setting Table ─────────────────────────────
    console.log("🛠️  Creating setting table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS setting (
        id TEXT PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // ── Log Table ─────────────────────────────────
    console.log("🛠️  Creating log table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS log (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // ── Seed Default Settings ─────────────────────
    console.log("🌱 Seeding default settings...");

    await client.query(
      `INSERT INTO setting (id, key, value)
       VALUES ($1, $2, $3)
       ON CONFLICT (key) DO NOTHING`,
      [crypto.randomUUID(), "scraper_keywords", '["Frontend", "React"]'],
    );

    await client.query(
      `INSERT INTO setting (id, key, value)
       VALUES ($1, $2, $3)
       ON CONFLICT (key) DO NOTHING`,
      [crypto.randomUUID(), "scraper_frequency", "60"],
    );

    console.log("✅ All tables created and settings seeded successfully.");
  } catch (error) {
    console.error("❌ Setup failed:", error);
  } finally {
    await client.end();
    console.log("🔌 Database connection closed.");
  }
}

setup();
