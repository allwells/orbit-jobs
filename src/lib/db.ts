import { Pool } from "pg";

/**
 * Shared Postgres pool for API routes and server actions.
 * Configured with SSL for production (Supabase compatibility).
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
  max: 20, // Reasonable limit for serverless
});

export default pool;
