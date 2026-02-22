"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/kysely";
import type { JobFilterParams } from "@/types/job";
import { sql } from "kysely";

export async function getJobsAction(
  filters: JobFilterParams,
  page: number = 1,
  pageSize: number = 25,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  // Build query
  let query = db.selectFrom("jobs").selectAll();
  let countQuery = db
    .selectFrom("jobs")
    .select(sql<number>`count(*)`.as("count"));

  // Apply search filter
  if (filters.search && filters.search.trim()) {
    const searchTerm = `%${filters.search.trim()}%`;
    query = query.where((eb) =>
      eb.or([
        eb("title", "ilike", searchTerm),
        eb("company", "ilike", searchTerm),
      ]),
    );
    countQuery = countQuery.where((eb) =>
      eb.or([
        eb("title", "ilike", searchTerm),
        eb("company", "ilike", searchTerm),
      ]),
    );
  }

  // Apply status filter
  if (filters.status && filters.status.length > 0) {
    // Cast strict type to string for Kysely compatibility if needed,
    // but Row type status is string|null, so it should be fine if we cast filter
    query = query.where("status", "in", filters.status);
    countQuery = countQuery.where("status", "in", filters.status);
  }

  // Apply remote filter
  if (filters.remote && filters.remote !== "all") {
    if (filters.remote === "remote") {
      query = query.where("remote_allowed", "=", true);
      countQuery = countQuery.where("remote_allowed", "=", true);
    } else if (filters.remote === "onsite") {
      query = query.where("remote_allowed", "=", false);
      countQuery = countQuery.where("remote_allowed", "=", false);
    }
  }

  // Apply salary filters
  if (filters.salaryMin !== undefined && filters.salaryMin > 0) {
    query = query.where("salary_min", ">=", filters.salaryMin);
    countQuery = countQuery.where("salary_min", ">=", filters.salaryMin);
  }
  if (filters.salaryMax !== undefined && filters.salaryMax > 0) {
    query = query.where("salary_max", "<=", filters.salaryMax);
    countQuery = countQuery.where("salary_max", "<=", filters.salaryMax);
  }

  // Apply date filter
  if (filters.dateAdded && filters.dateAdded !== "all") {
    const now = new Date();
    let dateThreshold: Date;

    switch (filters.dateAdded) {
      case "today":
        dateThreshold = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "7days":
        dateThreshold = new Date(now.setDate(now.getDate() - 7));
        break;
      case "30days":
        dateThreshold = new Date(now.setDate(now.getDate() - 30));
        break;
      case "90days":
        dateThreshold = new Date(now.setDate(now.getDate() - 90));
        break;
      default:
        dateThreshold = new Date(0);
    }

    // Cast timestamp to string for comparison or keep as Date object if driver supports
    // Kysely/pg usually handles Date objects fine
    const isoDate = dateThreshold.toISOString();
    query = query.where("created_at", ">=", isoDate);
    countQuery = countQuery.where("created_at", ">=", isoDate);
  }

  // Apply employment type filter
  if (filters.employmentTypes && filters.employmentTypes.length > 0) {
    query = query.where("employment_type", "in", filters.employmentTypes);
    countQuery = countQuery.where(
      "employment_type",
      "in",
      filters.employmentTypes,
    );
  }

  // Apply sorting
  const [sortField, sortDirection] = parseSortBy(filters.sortBy || "date_desc");
  // Kysely orderBy accepts "column" | "column direction" or expression
  // We need to cast our dynamic string to a safe column name known to Kysely
  // For safety, we can switch/case or trust parseSortBy returns safe strings

  // Safe cast because parseSortBy returns known keys
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query = query.orderBy(sortField as any, sortDirection);

  // Apply pagination
  query = query.limit(pageSize).offset((page - 1) * pageSize);

  // Execute
  const [jobs, countResult] = await Promise.all([
    query.execute(),
    countQuery.executeTakeFirst(),
  ]);

  return {
    jobs: jobs.map((job) => ({
      ...job,
      created_at: job.created_at
        ? new Date(job.created_at).toISOString()
        : null,
      updated_at: job.updated_at
        ? new Date(job.updated_at).toISOString()
        : null,
      posted_at: job.posted_at ? new Date(job.posted_at).toISOString() : null,
      // ensure JSON fields are parsed/serializable if needed, but pg driver returns objects usually
    })),
    totalCount: Number(countResult?.count || 0),
  };
}

function parseSortBy(sortBy: string): [string, "asc" | "desc"] {
  const sortMap: Record<string, [string, "asc" | "desc"]> = {
    date_desc: ["created_at", "desc"],
    date_asc: ["created_at", "asc"],
    salary_desc: ["salary_max", "desc"],
    salary_asc: ["salary_min", "asc"],
    company_asc: ["company", "asc"],
    company_desc: ["company", "desc"],
    title_asc: ["title", "asc"],
    title_desc: ["title", "desc"],
  };

  return sortMap[sortBy] || ["created_at", "desc"];
}
