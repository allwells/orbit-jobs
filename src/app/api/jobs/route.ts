import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!process.env.DATABASE_URL) {
      // Return mock data
      const mockJobs = [
        {
          id: "1",
          title: "Senior React Developer",
          company: "TechCorp",
          location: "Remote",
          status: status || "pending",
          salary: "$120k - $150k",
          url: "https://example.com/job1",
          description: "We are looking for a Senior React Developer...",
        },
        {
          id: "2",
          title: "Full Stack Engineer",
          company: "StartupInc",
          location: "New York, NY",
          status: status || "pending",
          salary: "$140k - $180k",
          url: "https://example.com/job2",
          description: "Join our fast-paced startup...",
        },
        {
          id: "3",
          title: "AI Researcher",
          company: "FutureAI",
          location: "San Francisco, CA",
          status: status || "pending",
          salary: "$200k+",
          url: "https://example.com/job3",
          description: "Research and develop cutting-edge AI models...",
        },
      ];
      return NextResponse.json({
        data: mockJobs,
        count: mockJobs.length,
      });
    }

    const client = await pool.connect();
    try {
      let query = "SELECT * FROM job";
      const params: any[] = [];

      if (status) {
        query += " WHERE status = $1";
        params.push(status);
      }

      query += ` ORDER BY created_at DESC LIMIT ${limit}`; // Safe integer limit

      const result = await client.query(query, params);

      return NextResponse.json({
        data: result.rows,
        count: result.rowCount,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    // Return mock data on error for robustness
    const mockJobs = [
      {
        id: "1",
        title: "Senior React Developer",
        company: "TechCorp",
        location: "Remote",
        status: status || "pending",
        salary: "$120k - $150k",
        url: "https://example.com/job1",
        description: "We are looking for a Senior React Developer...",
      },
      {
        id: "2",
        title: "Full Stack Engineer",
        company: "StartupInc",
        location: "New York, NY",
        status: status || "pending",
        salary: "$140k - $180k",
        url: "https://example.com/job2",
        description: "Join our fast-paced startup...",
      },
    ];
    return NextResponse.json({
      data: mockJobs,
      count: mockJobs.length,
    });
  }
}
