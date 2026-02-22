import fs from "fs";
import path from "path";
import { Pool } from "pg";
import * as dotenv from "dotenv";

// Load env vars from .env.local
dotenv.config({ path: ".env.local" });

async function main() {
  const connectionString =
    process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    console.error(
      "Error: DATABASE_URL or SUPABASE_DATABASE_URL not found in .env.local",
    );
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  const schemaPath = path.join(process.cwd(), "schema", "auth-schema.sql");

  if (!fs.existsSync(schemaPath)) {
    console.error(`Error: Schema file not found at ${schemaPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(schemaPath, "utf8");

  console.log("Running migration...");
  try {
    await pool.query(sql);
    console.log("Migration completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await pool.end();
  }
}

main();
