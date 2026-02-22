"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/kysely";
import { sql } from "kysely";
import { getJobsAction } from "./get-jobs";
import { getActivitiesAction } from "./get-activities";
import type { Job } from "@/types/job";
import type { Database } from "@/types/database";

type Activity = Database["public"]["Tables"]["activities"]["Row"];

export interface DashboardStats {
  totalJobs: { value: number; trend: number };
  pendingReview: { value: number; trend: number };
  approved: { value: number; trend: number };
  rejected: { value: number; trend: number };
  postedToX: { value: number; trend: number };
}

export async function getDashboardStatsAction(): Promise<DashboardStats> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Helper to get count and trend
  const getStatWithTrend = async (
    status?: "pending" | "approved" | "rejected" | "posted",
  ) => {
    let queryCurrent = db
      .selectFrom("jobs")
      .select(sql<number>`count(*)`.as("count"));
    let queryPast = db
      .selectFrom("jobs")
      .select(sql<number>`count(*)`.as("count"));
    let queryTotal = db
      .selectFrom("jobs")
      .select(sql<number>`count(*)`.as("count"));

    if (status === "posted") {
      queryCurrent = queryCurrent.where("posted_to_x", "=", true);
      queryPast = queryPast.where("posted_to_x", "=", true);
      queryTotal = queryTotal.where("posted_to_x", "=", true);
    } else if (status) {
      queryCurrent = queryCurrent.where("status", "=", status);
      queryPast = queryPast.where("status", "=", status);
      queryTotal = queryTotal.where("status", "=", status);
    }

    // Filter by date for trend
    const currentCountQuery = queryCurrent
      .where("created_at", ">=", thirtyDaysAgo.toISOString())
      .executeTakeFirst();

    const pastCountQuery = queryPast
      .where("created_at", ">=", sixtyDaysAgo.toISOString())
      .where("created_at", "<", thirtyDaysAgo.toISOString())
      .executeTakeFirst();

    const totalCountQuery = queryTotal.executeTakeFirst();

    const [current, past, total] = await Promise.all([
      currentCountQuery,
      pastCountQuery,
      totalCountQuery,
    ]);

    const currentVal = Number(current?.count || 0);
    const pastVal = Number(past?.count || 0);
    const totalVal = Number(total?.count || 0);

    let trend = 0;
    if (pastVal > 0) {
      trend = Math.round(((currentVal - pastVal) / pastVal) * 100);
    } else if (currentVal > 0) {
      trend = 100; // 100% increase if started from 0
    }

    return { value: totalVal, trend };
  };

  const [total, pending, approved, rejected, posted] = await Promise.all([
    getStatWithTrend(),
    getStatWithTrend("pending"),
    getStatWithTrend("approved"),
    getStatWithTrend("rejected"),
    getStatWithTrend("posted"),
  ]);

  return {
    totalJobs: total,
    pendingReview: pending,
    approved: approved,
    rejected: rejected,
    postedToX: posted,
  };
}

export interface DashboardData {
  stats: DashboardStats;
  recentJobs: Job[];
  recentActivities: Activity[];
}

export async function getDashboardDataAction(): Promise<DashboardData> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const [stats, jobsResult, activities] = await Promise.all([
    getDashboardStatsAction(),
    getJobsAction({ sortBy: "date_desc" }, 1, 6),
    getActivitiesAction(),
  ]);

  return {
    stats,
    recentJobs: jobsResult.jobs,
    recentActivities: activities.slice(0, 10),
  };
}
