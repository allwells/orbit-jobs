import { NextResponse } from "next/server";
import { scrapeJobDescription } from "@/lib/scraper";
import pool from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { id, url } = await req.json();

    if (!id || !url) {
      return NextResponse.json({ error: "Missing id or url" }, { status: 400 });
    }

    const description = await scrapeJobDescription(url);

    if (description) {
      // Update job description in DB
      const client = await pool.connect();
      try {
        await client.query(
          "UPDATE job SET description = $1, updated_at = NOW() WHERE id = $2",
          [description, id],
        );
      } finally {
        client.release();
      }

      return NextResponse.json({ success: true, description });
    } else {
      return NextResponse.json(
        { error: "Failed to scrape description" },
        { status: 404 },
      );
    }
  } catch (error) {
    console.error("Scrape description error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
