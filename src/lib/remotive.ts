import axios from "axios";
import { JobFilters } from "./job-service"; // We need to update job-service to export JobFilters

const BASE_URL = "https://remotive.com/api/remote-jobs";

export interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  company_logo: string;
  category: string;
  job_type: string;
  publication_date: string;
  candidate_required_location: string;
  salary: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface RemotiveResponse {
  "0-legal-notice": string;
  "job-count": number;
  jobs: RemotiveJob[];
}

export async function searchRemotiveJobs(
  filters: JobFilters,
): Promise<RemotiveJob[]> {
  try {
    let finalQuery = filters.query;
    if (
      filters.remoteJobsOnly &&
      !finalQuery.toLowerCase().includes("remote")
    ) {
      finalQuery = `${finalQuery} remote`; // Remotive is always remote anyway, but including query modifications for consistency
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: Record<string, any> = {
      limit: filters.numResults || 10,
      search: finalQuery,
    };

    // Note: Remotive API does not natively support detailed parameters like location, date_posted, or employmentTypes
    // It's a remote-only board. We fetch the closest matches via `search` and apply client-side filtering if needed

    const response = await axios.get<RemotiveResponse>(BASE_URL, {
      params,
    });

    let results = response.data.jobs || [];

    // Client-side filtering for properties not supported by Remotive's API native parameters
    if (filters.employmentTypes?.length) {
      // mapping our UPPERCASE values to remotive's lowercase string format loosely
      const allowedTypes = filters.employmentTypes.map((t) =>
        t.toLowerCase().replace("-", "_"),
      );

      results = results.filter((job) => {
        if (!job.job_type) return true; // include if not specified
        const typeMatch = allowedTypes.some(
          (type) =>
            job.job_type.toLowerCase().includes(type) ||
            type.includes(job.job_type.toLowerCase()),
        );
        return typeMatch;
      });
    }

    if (filters.datePosted && filters.datePosted !== "all") {
      const now = new Date();
      let maxDays = 365; // virtually no limit

      if (filters.datePosted === "today") maxDays = 1;
      else if (filters.datePosted === "3days") maxDays = 3;
      else if (filters.datePosted === "week") maxDays = 7;
      else if (filters.datePosted === "month") maxDays = 30;

      const cutoffDate = new Date(
        now.getTime() - maxDays * 24 * 60 * 60 * 1000,
      );

      results = results.filter((job) => {
        if (!job.publication_date) return true;
        const pubDate = new Date(job.publication_date);
        return pubDate >= cutoffDate;
      });
    }

    return results.slice(0, filters.numResults || 10);
  } catch (error) {
    console.error("Remotive API error:", error);
    throw new Error("Failed to fetch jobs from Remotive API");
  }
}
