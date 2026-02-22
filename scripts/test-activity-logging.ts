import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const connectionString =
  process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ Missing database connection string");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function testActivityLogging() {
  console.log("🚀 Testing Activity Logging (via PG)...");

  try {
    // 1. Get a user
    const userRes = await pool.query("SELECT id, username FROM users LIMIT 1");
    if (userRes.rows.length === 0) {
      console.error("❌ No users found to test with.");
      return;
    }
    const user = userRes.rows[0];
    console.log(`👤 Using user: ${user.username} (${user.id})`);

    // 2. Log an activity
    const activityType = "test_activity";
    const title = "Test Activity Log (PG)";
    const description = "Test log via direct PG connection";
    const metadata = JSON.stringify({ test: true, environment: "ci" });

    const insertRes = await pool.query(
      `INSERT INTO activities (user_id, activity_type, title, description, metadata) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, title`,
      [user.id, activityType, title, description, metadata],
    );

    const inserted = insertRes.rows[0];
    console.log("✅ Activity logged successfully:", inserted.id);

    // 3. Verify retrieval
    const fetchRes = await pool.query(
      "SELECT * FROM activities WHERE id = $1",
      [inserted.id],
    );
    const fetched = fetchRes.rows[0];

    if (fetched && fetched.title === title) {
      console.log("✅ Verified activity data matches.");
    } else {
      console.error("❌ Activity data mismatch or not found!");
    }
  } catch (err) {
    console.error("❌ Test failed:", err);
  } finally {
    await pool.end();
  }
}

testActivityLogging();
