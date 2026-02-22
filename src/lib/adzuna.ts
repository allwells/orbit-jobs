import axios from "axios";
import { JobFilters } from "./job-service"; // We need to update job-service to export JobFilters

const ADZUNA_API_ID = process.env.ADZUNA_API_ID!;
const ADZUNA_API_KEY = process.env.ADZUNA_API_KEY!;
const BASE_URL = "https://api.adzuna.com/v1/api/jobs";

export interface AdzunaJob {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string; area: string[] };
  description: string;
  salary_min?: number;
  salary_max?: number;
  contract_type?: string;
  created: string;
  redirect_url: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface AdzunaResponse {
  count: number;
  mean_salary: number;
  results: AdzunaJob[];
}

export async function searchAdzunaJobs(
  filters: JobFilters,
): Promise<AdzunaJob[]> {
  if (!ADZUNA_API_ID || !ADZUNA_API_KEY) {
    throw new Error(
      "Adzuna API credentials are not defined in environment variables",
    );
  }

  try {
    const country = "us"; // Adzuna requires a country code, default to US, we can make it dynamic later if needed
    const page = 1;

    let finalQuery = filters.query;
    if (
      filters.remoteJobsOnly &&
      !finalQuery.toLowerCase().includes("remote")
    ) {
      finalQuery = `${finalQuery} remote`;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: Record<string, any> = {
      app_id: ADZUNA_API_ID,
      app_key: ADZUNA_API_KEY,
      results_per_page: filters.numResults || 10,
      what: finalQuery,
    };

    if (filters.location) params.where = filters.location;

    // Adzuna full_time, part_time, contract values
    if (filters.employmentTypes?.length) {
      if (filters.employmentTypes.includes("FULLTIME")) params.full_time = 1;
      if (filters.employmentTypes.includes("PARTTIME")) params.part_time = 1;
      if (filters.employmentTypes.includes("CONTRACTOR")) params.contract = 1;
    }

    // Adzuna max_days_old
    if (filters.datePosted && filters.datePosted !== "all") {
      if (filters.datePosted === "today") params.max_days_old = 1;
      else if (filters.datePosted === "3days") params.max_days_old = 3;
      else if (filters.datePosted === "week") params.max_days_old = 7;
      else if (filters.datePosted === "month") params.max_days_old = 30;
    }

    const url = `${BASE_URL}/${country}/search/${page}`;
    console.log("Adzuna Request URL:", url);
    console.log("Adzuna Request Params:", {
      ...params,
      app_id: "***",
      app_key: "***",
    });

    const response = await axios.get<AdzunaResponse>(url, {
      params,
    });

    let results = response.data.results || [];

    if (filters.remoteJobsOnly) {
      results = results.filter(
        (job) =>
          job.title?.toLowerCase().includes("remote") ||
          job.description?.toLowerCase().includes("remote") ||
          job.location?.display_name?.toLowerCase().includes("remote"),
      );
    }

    return results;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("Adzuna API Error Response Data:", error.response.data);
      console.error("Adzuna API Error Status:", error.response.status);
    }
    console.error("Adzuna API error:", error.message || error);
    throw new Error("Failed to fetch jobs from Adzuna API");
  }
}
