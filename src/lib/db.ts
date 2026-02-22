import { Pool } from "pg";

const connectionString =
  process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "No database connection string found in environment variables",
  );
}

export const db = new Pool({
  connectionString,
  max: 5,
  ssl: {
    rejectUnauthorized: false,
  },
});
