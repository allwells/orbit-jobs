import { hashPassword } from "better-auth/crypto";
import { Client } from "pg";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const USERNAME = process.env.ADMIN_USERNAME;
const PASSWORD = process.env.ADMIN_PASSWORD;

/**
 * Seed Script: Securely creates the initial admin user.
 * Restricted to username orbitjobsadmin.
 */
async function seed() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("❌ Error: DATABASE_URL is not set in .env.local");
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
  });

  try {
    await client.connect();
    console.log("🔗 Connected to database.");

    // 1. Create tables if they don't exist (Simplified BetterAuth v1 schema)
    console.log("🛠️  Ensuring core authentication tables exist...");

    // User Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
        image TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        password TEXT,
        username TEXT UNIQUE
      );
    `);

    // Session Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS session (
        id TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        "expiresAt" TIMESTAMP NOT NULL,
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Account Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS account (
        id TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        "accountId" TEXT NOT NULL,
        "providerId" TEXT NOT NULL,
        "accessToken" TEXT,
        "refreshToken" TEXT,
        "accessTokenExpiresAt" TIMESTAMP,
        "refreshTokenExpiresAt" TIMESTAMP,
        scope TEXT,
        "idToken" TEXT,
        password TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Verification Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS verification (
        id TEXT PRIMARY KEY,
        identifier TEXT NOT NULL,
        value TEXT NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // 2. Hash Password and Insert Admin
    const hashedPassword = await hashPassword(PASSWORD!);
    const userId = crypto.randomUUID();
    const accountId = crypto.randomUUID();

    console.log(`👤 Seeding admin user: ${USERNAME}`);

    const result = await client.query(
      `INSERT INTO "user" (id, name, email, password, username) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (username) 
       DO UPDATE SET password = EXCLUDED.password
       RETURNING id`,
      [userId, "Admin", "admin@orbitjobs.local", hashedPassword, USERNAME],
    );

    const actualUserId = result.rows[0].id;

    // 3. Create credential account record (Better Auth looks here for passwords)
    // Remove any existing credential account for this user, then insert fresh
    await client.query(
      `DELETE FROM account WHERE "userId" = $1 AND "providerId" = 'credential'`,
      [actualUserId],
    );
    await client.query(
      `INSERT INTO account (id, "userId", "accountId", "providerId", password)
       VALUES ($1, $2, $3, $4, $5)`,
      [accountId, actualUserId, actualUserId, "credential", hashedPassword],
    );

    if (result.rows.length > 0) {
      console.log(
        "✅ Admin user and credential account successfully seeded or updated.",
      );
    } else {
      console.log("ℹ️  Admin user already exists.");
    }
  } catch (error) {
    console.error("❌ Seed failed:", error);
  } finally {
    await client.end();
    console.log("🔌 Database connection closed.");
  }
}

seed();
