import { NextResponse } from "next/server";
import { runScraper } from "@/lib/scraper";
import { Client } from "pg";

/** POST /api/scraper/run — trigger a scrape run */
export async function POST() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return NextResponse.json(
      { error: "DATABASE_URL not configured" },
      { status: 500 },
    );
  }

  // Fetch keywords from settings
  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    const result = await client.query(
      "SELECT value FROM setting WHERE key = $1",
      ["scraper_keywords"],
    );

    let keywords: string[] = ["Frontend", "React"];
    if (result.rows.length > 0) {
      try {
        keywords = JSON.parse(result.rows[0].value);
      } catch {
        // fallback to default
      }
    }

    await client.end();

    // Run the scraper
    const scrapeResult = await runScraper(keywords, databaseUrl);
    return NextResponse.json(scrapeResult);
  } catch (error) {
    console.error("Scraper run failed:", error);
    try {
      await client.end();
    } catch {
      // already closed
    }
    return NextResponse.json(
      {
        success: false,
        jobsFound: 0,
        jobsInserted: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
