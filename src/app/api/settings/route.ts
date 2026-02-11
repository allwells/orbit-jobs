import { NextResponse } from "next/server";
import { Client } from "pg";

/** GET /api/settings — returns all settings as key-value map */
export async function GET() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    const result = await client.query("SELECT key, value FROM setting");

    const settings: Record<string, string> = {};
    for (const row of result.rows) {
      settings[row.key] = row.value;
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    );
  } finally {
    await client.end();
  }
}

/** POST /api/settings — upsert a setting */
export async function POST(request: Request) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: "Missing key or value" },
        { status: 400 },
      );
    }

    await client.connect();
    await client.query(
      `INSERT INTO setting (id, key, value, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (key)
       DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [
        crypto.randomUUID(),
        key,
        typeof value === "string" ? value : JSON.stringify(value),
      ],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update setting:", error);
    return NextResponse.json(
      { error: "Failed to update setting" },
      { status: 500 },
    );
  } finally {
    await client.end();
  }
}
