import axios from "axios";
import { JobFilters } from "./job-service";

const BASE_URL = "https://remoteok.com/api";

export interface RemoteOKJob {
  slug: string;
  id: string;
  epoch: number;
  date: string;
  company: string;
  company_logo: string;
  position: string;
  tags: string[];
  description: string;
  location: string;
  apply_url: string;
  salary_min: number;
  salary_max: number;
  logo: string;
  url: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export async function searchRemoteOKJobs(
  filters: JobFilters,
): Promise<RemoteOKJob[]> {
  try {
    // Note: Remote OK API typically returns a large list including legal info as the first element
    // This endpoint doesn't support query parameters for filtering in the way JSearch does.
    // We fetch everything and filter locally.

    // Remote OK often requires a User-Agent or it might block simple axios requests
    const response = await axios.get(BASE_URL, {
      headers: {
        "User-Agent": "OrbitJobs/1.0 (Contact: allwellsofficial@gmail.com)",
      },
    });

    if (!Array.isArray(response.data)) {
      throw new Error("Invalid response format from Remote OK API");
    }

    // Skip the first element if it's the legal notice (it usually has a 'legal' property or similar)
    const jobs = response.data.filter(
      (item) => item.id !== undefined,
    ) as RemoteOKJob[];

    let filteredResults = jobs;

    // Filter by query (search position, company, tags, description)
    if (filters.query) {
      const q = filters.query.toLowerCase();
      filteredResults = filteredResults.filter(
        (job) =>
          job.position?.toLowerCase().includes(q) ||
          job.company?.toLowerCase().includes(q) ||
          job.tags?.some((tag) => tag.toLowerCase().includes(q)) ||
          job.description?.toLowerCase().includes(q),
      );
    }

    // Filter by location
    if (filters.location) {
      const loc = filters.location.toLowerCase();
      filteredResults = filteredResults.filter((job) =>
        job.location?.toLowerCase().includes(loc),
      );
    }

    // Filter by date
    if (filters.datePosted && filters.datePosted !== "all") {
      const now = new Date();
      let maxDays = 365;
      if (filters.datePosted === "today") maxDays = 1;
      else if (filters.datePosted === "3days") maxDays = 3;
      else if (filters.datePosted === "week") maxDays = 7;
      else if (filters.datePosted === "month") maxDays = 30;

      const cutoff = now.getTime() - maxDays * 24 * 60 * 60 * 1000;
      filteredResults = filteredResults.filter(
        (job) => (job.epoch ? job.epoch * 1000 : 0) >= cutoff,
      );
    }

    // Remote OK is remote by default, remoteJobsOnly is usually true

    return filteredResults.slice(0, filters.numResults || 20);
  } catch (error) {
    console.error("Remote OK API error:", error);
    throw new Error("Failed to fetch jobs from Remote OK API");
  }
}
