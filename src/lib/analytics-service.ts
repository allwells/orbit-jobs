import { db } from "@/lib/kysely";
import { sql } from "kysely";
import type { Database } from "@/types/database";

export type Activity = Database["public"]["Tables"]["activities"]["Row"];
export type Job = Database["public"]["Tables"]["jobs"]["Row"];

export interface AnalyticsData {
  stats: {
    totalFetched: number;
    pending: number;
    approved: number;
    rejected: number;
    posted: number;
    postReady: number;
    approvalRate: number;
  };
  charts: {
    jobs: {
      labels: string[];
      newJobs: number[];
      duplicates: number[];
    };
    status: {
      pending: number;
      approved: number;
      rejected: number;
      posted: number;
    };
    salary: {
      labels: string[];
      counts: number[];
    };
    companies: {
      labels: string[];
      counts: number[];
    };
  };
}

export interface DashboardOverview {
  analytics: AnalyticsData;
  recentJobs: Job[];
  recentActivities: Activity[];
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const [analytics, recentJobs, recentActivities] = await Promise.all([
    getAnalyticsData(),
    getRecentJobs(10),
    getRecentActivities(20),
  ]);

  return {
    analytics,
    recentJobs,
    recentActivities,
  };
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const dateStr = thirtyDaysAgo.toISOString();

  // 1. Fetch Job Stats (Counts by Status) - Parallel Execution
  const [
    pendingRes,
    approvedRes,
    postReadyRes,
    rejectedRes,
    postedRes,
    totalFetchedRes,
    postedToXRes,
    fetchActivitiesRes,
    jobsAnalysisRes,
  ] = await Promise.all([
    db
      .selectFrom("jobs")
      .select(sql<number>`count(*)`.as("count"))
      .where("status", "=", "pending")
      .executeTakeFirst(),
    db
      .selectFrom("jobs")
      .select(sql<number>`count(*)`.as("count"))
      .where("status", "=", "approved")
      .executeTakeFirst(),
    db
      .selectFrom("jobs")
      .select(sql<number>`count(*)`.as("count"))
      .where("status", "=", "approved")
      .where("ai_content_generated", "=", true)
      .executeTakeFirst(),
    db
      .selectFrom("jobs")
      .select(sql<number>`count(*)`.as("count"))
      .where("status", "=", "rejected")
      .executeTakeFirst(),
    db
      .selectFrom("jobs")
      .select(sql<number>`count(*)`.as("count"))
      .where("status", "=", "posted")
      .executeTakeFirst(),
    db
      .selectFrom("jobs")
      .select(sql<number>`count(*)`.as("count"))
      .executeTakeFirst(),
    db
      .selectFrom("jobs")
      .select(sql<number>`count(*)`.as("count"))
      .where("posted_to_x", "=", true)
      .executeTakeFirst(),
    db
      .selectFrom("activities")
      .select(["created_at", "metadata"])
      .where("activity_type", "=", "job_fetch")
      .where("created_at", ">=", dateStr)
      .orderBy("created_at", "asc")
      .execute(),
    db
      .selectFrom("jobs")
      .select(["salary_min", "company"])
      .where("company", "is not", null)
      .execute(),
  ]);

  const pendingCount = Number(pendingRes?.count || 0);
  const approvedCount = Number(approvedRes?.count || 0);
  const postReadyCount = Number(postReadyRes?.count || 0);
  const rejectedCount = Number(rejectedRes?.count || 0);
  const postedCount = Number(postedRes?.count || 0);
  const totalFetched = Number(totalFetchedRes?.count || 0);
  const postedToXCount = Number(postedToXRes?.count || 0);
  const fetchActivities = fetchActivitiesRes;
  const jobsAnalysis = jobsAnalysisRes;

  // Process Salary Distribution
  const salaryRanges = {
    "< $50k": 0,
    "$50k - $80k": 0,
    "$80k - $120k": 0,
    "$120k - $160k": 0,
    "$160k+": 0,
  };

  const companyCounts: Record<string, number> = {};

  jobsAnalysis?.forEach((job) => {
    // Salary
    if (job.salary_min) {
      if (job.salary_min < 50000) salaryRanges["< $50k"]++;
      else if (job.salary_min < 80000) salaryRanges["$50k - $80k"]++;
      else if (job.salary_min < 120000) salaryRanges["$80k - $120k"]++;
      else if (job.salary_min < 160000) salaryRanges["$120k - $160k"]++;
      else salaryRanges["$160k+"]++;
    }

    // Company
    if (job.company) {
      companyCounts[job.company] = (companyCounts[job.company] || 0) + 1;
    }
  });

  // Top 5 Companies
  const sortedCompanies = Object.entries(companyCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const topCompanies = {
    labels: sortedCompanies.map(([name]) => name),
    counts: sortedCompanies.map(([, count]) => count),
  };

  // Process activity data for chart
  const chartLabels: string[] = [];
  const chartNewJobs: number[] = [];
  const chartDuplicates: number[] = [];

  // Create array of last 30 days strings
  const dates: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]); // YYYY-MM-DD
  }

  const dateMap = new Map<string, { new: number; duplicates: number }>();
  dates.forEach((d) => dateMap.set(d, { new: 0, duplicates: 0 }));

  fetchActivities?.forEach((activity) => {
    if (!activity.created_at) return;
    const day = new Date(activity.created_at).toISOString().split("T")[0];
    if (dateMap.has(day)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const meta = activity.metadata as any;
      const current = dateMap.get(day)!;
      dateMap.set(day, {
        new: current.new + (meta?.newJobs || 0),
        duplicates: current.duplicates + (meta?.duplicates || 0),
      });
    }
  });

  dateMap.forEach((val, key) => {
    const dateObj = new Date(key);
    const label = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    chartLabels.push(label);
    chartNewJobs.push(val.new);
    chartDuplicates.push(val.duplicates);
  });

  return {
    stats: {
      totalFetched: totalFetched || 0,
      pending: pendingCount || 0,
      approved: approvedCount || 0,
      postReady: postReadyCount || 0,
      rejected: rejectedCount || 0,
      posted: postedToXCount || 0,
      approvalRate: totalFetched
        ? Math.round(
            (((approvedCount || 0) + (postedCount || 0)) / totalFetched) * 100,
          )
        : 0,
    },
    charts: {
      jobs: {
        labels: chartLabels,
        newJobs: chartNewJobs,
        duplicates: chartDuplicates,
      },
      status: {
        pending: pendingCount || 0,
        approved: approvedCount || 0,
        rejected: rejectedCount || 0,
        posted: postedToXCount || 0,
      },
      salary: {
        labels: Object.keys(salaryRanges),
        counts: Object.values(salaryRanges),
      },
      companies: topCompanies,
    },
  };
}

export async function getRecentActivities(limit = 20) {
  const activities = await db
    .selectFrom("activities")
    .selectAll()
    .orderBy("created_at", "desc")
    .limit(limit)
    .execute();

  return activities;
}

export async function getRecentJobs(limit = 5) {
  const jobs = await db
    .selectFrom("jobs")
    .selectAll()
    .orderBy("created_at", "desc")
    .limit(limit)
    .execute();

  // Map to match the expected return type if there are slight differences or needed transformations
  // Kysely returns proper types based on interface, so mostly pass-through.
  // Although we might need to cast dates if they come back as Date objects and we expect strings,
  // typically the consuming components handle strings or Date objects.
  // Looking at previous implementation, it expected simple return.

  return jobs;
}
