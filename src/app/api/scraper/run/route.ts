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
      "SELECT key, value FROM setting WHERE key IN ($1, $2)",
      ["scraper_keywords", "scraper_limit"],
    );

    let keywords: string[] = ["Frontend", "React"];
    let limit = 20;

    for (const row of result.rows) {
      if (row.key === "scraper_keywords") {
        try {
          keywords = JSON.parse(row.value);
        } catch {}
      } else if (row.key === "scraper_limit") {
        try {
          limit = parseInt(row.value);
        } catch {}
      }
    }

    await client.end();

    // Run the scraper
    const scrapeResult = await runScraper(keywords, databaseUrl, limit);
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
