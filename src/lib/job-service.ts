import { db } from "@/lib/db";
import { db as kyselyDb } from "@/lib/kysely";
import { searchJobs, type JSearchJob } from "./jsearch";
import { searchAdzunaJobs, type AdzunaJob } from "./adzuna";
import { searchRemotiveJobs, type RemotiveJob } from "./remotive";
import { searchRemoteOKJobs, type RemoteOKJob } from "./remoteok";
import { activityLogger, logActivityServer } from "./activity-logger";
import {
  notifyBatchNewJobs,
  notifyJobFetchComplete,
} from "./notification-service";
import type { Job } from "@/types/job";

export interface JobFilters {
  query: string; // e.g., "remote react developer"
  location?: string; // Optional location filter
  remoteJobsOnly?: boolean;
  employmentTypes?: ("FULLTIME" | "CONTRACTOR" | "PARTTIME" | "INTERN")[];
  jobRequirements?: (
    | "under_3_years_experience"
    | "more_than_3_years_experience"
    | "no_experience"
    | "no_degree"
  )[];
  datePosted?: "all" | "today" | "3days" | "week" | "month";
  numResults?: number;
  provider?: "jsearch" | "adzuna" | "remotive" | "remoteok";
}

export interface JobFetchResult {
  totalFetched: number;
  newJobs: number;
  duplicates: number;
  jobs: Job[];
}

export async function fetchAndStoreJobs(
  userId: string,
  filters: JobFilters,
): Promise<JobFetchResult> {
  const startTime = Date.now();
  const provider = filters.provider || "jsearch";

  try {
    let apiJobs: any[] = [];
    let jobIds: string[] = [];

    // Fetch from selected API
    if (provider === "adzuna") {
      apiJobs = await searchAdzunaJobs(filters);
      jobIds = apiJobs.map((job) => `adzuna-${job.id}`);
    } else if (provider === "remotive") {
      apiJobs = await searchRemotiveJobs(filters);
      jobIds = apiJobs.map((job) => `remotive-${job.id}`);
    } else if (provider === "remoteok") {
      apiJobs = await searchRemoteOKJobs(filters);
      jobIds = apiJobs.map((job) => `remoteok-${job.id}`);
    } else {
      apiJobs = await searchJobs({
        ...filters,
        // map our standard job filters back to jsearch filters format loosely, although the types align mostly well
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        query: filters.query,
      } as any);
      jobIds = apiJobs.map((job) => job.job_id);
    }

    const totalFetched = apiJobs.length;

    if (totalFetched === 0) {
      await activityLogger.logJobFetch(userId, {
        query: filters.query,
        filters: filters,
        totalFetched: 0,
        newJobs: 0,
        duplicates: 0,
        apiResponseTime: Date.now() - startTime,
      });

      return {
        totalFetched: 0,
        newJobs: 0,
        duplicates: 0,
        jobs: [],
      };
    }

    // Check for existing job_ids in database
    // pg syntax for ANY array
    const existingJobsResult = await db.query(
      "SELECT job_id FROM jobs WHERE job_id = ANY($1)",
      [jobIds],
    );

    const existingJobIds = new Set(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      existingJobsResult.rows.map((row: any) => row.job_id),
    );

    // Filter out duplicates and transform
    let newApiJobs: any[] = [];
    let jobsToInsert: Partial<Job>[] = [];

    if (provider === "adzuna") {
      newApiJobs = apiJobs.filter(
        (job) => !existingJobIds.has(`adzuna-${job.id}`),
      );
      jobsToInsert = newApiJobs.map(transformAdzunaJobToDbJob);
    } else if (provider === "remotive") {
      newApiJobs = apiJobs.filter(
        (job) => !existingJobIds.has(`remotive-${job.id}`),
      );
      jobsToInsert = newApiJobs.map(transformRemotiveJobToDbJob);
    } else if (provider === "remoteok") {
      newApiJobs = apiJobs.filter(
        (job) => !existingJobIds.has(`remoteok-${job.id}`),
      );
      jobsToInsert = newApiJobs.map(transformRemoteOKJobToDbJob);
    } else {
      newApiJobs = apiJobs.filter((job) => !existingJobIds.has(job.job_id));
      jobsToInsert = newApiJobs.map(transformJSearchJobToDbJob);
    }

    const insertedJobs: Job[] = [];
    if (jobsToInsert.length > 0) {
      try {
        const result = await kyselyDb
          .insertInto("jobs")
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .values(jobsToInsert as any[])
          .returningAll()
          .execute();

        insertedJobs.push(...(result as Job[]));
      } catch (e) {
        console.error("Batch insert failed:", e);
        throw e;
      }
    }

    const apiResponseTime = Date.now() - startTime;

    // Log activity
    await activityLogger.logJobFetch(userId, {
      query: filters.query,
      filters: filters,
      totalFetched,
      newJobs: newApiJobs.length,
      duplicates: totalFetched - newApiJobs.length,
      apiResponseTime,
    });

    // Send Telegram notifications
    if (insertedJobs.length > 0) {
      await notifyBatchNewJobs(insertedJobs);
    }

    await notifyJobFetchComplete(
      totalFetched,
      newApiJobs.length,
      totalFetched - newApiJobs.length,
    );

    // Update last run stats in job_fetch_config
    await updateLastRunStats(userId, {
      totalFetched,
      newJobs: newApiJobs.length,
      duplicates: totalFetched - newApiJobs.length,
    });

    return {
      totalFetched,
      newJobs: newApiJobs.length,
      duplicates: totalFetched - newApiJobs.length,
      jobs: insertedJobs,
    };
  } catch (error) {
    // Log error activity
    await logActivityServer({
      userId,
      activityType: "api_error",
      title: "API Error",
      description: error instanceof Error ? error.message : "Unknown error",
      metadata: {
        endpoint: `${provider}/search`,
        error: error instanceof Error ? error.message : "Unknown error",
        ...filters,
      },
    });
    throw error;
  }
}

// Export for testing
export function transformJSearchJobToDbJob(apiJob: JSearchJob): Partial<Job> {
  // Using Partial<Job> because id, created_at, updated_at are generated by DB
  // Extract skills from job_highlights if required_skills is missing
  const qualifications = apiJob.job_highlights?.Qualifications || [];
  const explicitSkills = apiJob.job_required_skills || [];

  // Combine unique skills/highlights
  const combinedSkills = Array.from(
    new Set([
      ...explicitSkills,
      ...qualifications.slice(0, 5), // Take top 5 qualifications as fallback skills
    ]),
  );

  return {
    job_id: apiJob.job_id,
    title: apiJob.job_title,
    company: apiJob.employer_name,
    location:
      [apiJob.job_city, apiJob.job_state, apiJob.job_country]
        .filter(Boolean)
        .join(", ") || null,
    salary_min: apiJob.job_min_salary
      ? Math.round(apiJob.job_min_salary)
      : null,
    salary_max: apiJob.job_max_salary
      ? Math.round(apiJob.job_max_salary)
      : null,
    salary_currency: apiJob.job_salary_currency || "USD",
    employment_type: apiJob.job_employment_type,
    remote_allowed: apiJob.job_is_remote || false, // Default to false if null/undefined
    description: apiJob.job_description,
    required_skills: combinedSkills,
    apply_url: apiJob.job_apply_link,
    source: "jsearch",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    raw_data: apiJob as any,
    status: "pending",
  };
}

export function transformAdzunaJobToDbJob(apiJob: AdzunaJob): Partial<Job> {
  return {
    job_id: `adzuna-${apiJob.id}`,
    title: apiJob.title,
    company: apiJob.company?.display_name || "Unknown Company",
    location: apiJob.location?.display_name || null,
    salary_min: apiJob.salary_min ? Math.round(apiJob.salary_min) : null,
    salary_max: apiJob.salary_max ? Math.round(apiJob.salary_max) : null,
    salary_currency: "USD",
    employment_type: apiJob.contract_type || null,
    remote_allowed:
      apiJob.title?.toLowerCase().includes("remote") ||
      apiJob.location?.display_name?.toLowerCase().includes("remote") ||
      false,
    description: apiJob.description,
    required_skills: [],
    apply_url: apiJob.redirect_url,
    source: "adzuna",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    raw_data: apiJob as any,
    status: "pending",
  };
}

export function transformRemotiveJobToDbJob(apiJob: RemotiveJob): Partial<Job> {
  return {
    job_id: `remotive-${apiJob.id}`,
    title: apiJob.title,
    company: apiJob.company_name,
    location: apiJob.candidate_required_location || "Worldwide",
    salary_min: null,
    salary_max: null,
    salary_currency: "USD",
    employment_type: apiJob.job_type || null,
    remote_allowed: true,
    description: apiJob.description,
    required_skills: apiJob.category ? [apiJob.category] : [],
    apply_url: apiJob.url,
    source: "remotive",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    raw_data: apiJob as any,
    status: "pending",
  };
}

export function transformRemoteOKJobToDbJob(apiJob: RemoteOKJob): Partial<Job> {
  return {
    job_id: `remoteok-${apiJob.id}`,
    title: apiJob.position,
    company: apiJob.company,
    location: apiJob.location || "Remote",
    salary_min: apiJob.salary_min || null,
    salary_max: apiJob.salary_max || null,
    salary_currency: "USD",
    employment_type: null,
    remote_allowed: true,
    description: apiJob.description,
    required_skills: apiJob.tags || [],
    apply_url: apiJob.apply_url || apiJob.url,
    source: "remoteok",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    raw_data: apiJob as any,
    status: "pending",
  };
}

async function updateLastRunStats(
  userId: string,
  stats: {
    totalFetched: number;
    newJobs: number;
    duplicates: number;
  },
): Promise<void> {
  try {
    // We only update the default config or the most recent one.
    // For now, let's update the entry marked is_default = true
    const query = `
      UPDATE job_fetch_config
      SET 
        last_run_at = NOW(),
        last_run_results_count = $1,
        last_run_new_jobs = $2,
        last_run_duplicates = $3
      WHERE user_id = $4 AND is_default = true
    `;

    await db.query(query, [
      stats.totalFetched,
      stats.newJobs,
      stats.duplicates,
      userId,
    ]);
  } catch (error) {
    console.error("Failed to update last run stats:", error);
  }
}
