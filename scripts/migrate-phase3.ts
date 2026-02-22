import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const runMigration = async () => {
  const connectionString =
    process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    console.error(
      "❌ No database connection string found in environment variables.",
    );
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    const schemaPath = path.join(process.cwd(), "src/schema/phase3.sql");
    const sql = fs.readFileSync(schemaPath, "utf8");

    console.log("🚀 Running Phase 3 migration...");

    // Split by semicolons to run as separate statements if needed,
    // but pg node driver can often handle multiple statements in one query.
    // For safety with comments and complex logic, running as one block usually works
    // unless there are specific transaction blocks.
    await pool.query(sql);

    console.log("✅ Migration completed successfully.");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runMigration();
