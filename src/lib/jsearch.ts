import axios from "axios";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!;
const RAPIDAPI_HOST = "jsearch.p.rapidapi.com";
const BASE_URL = "https://jsearch.p.rapidapi.com";

export interface JSearchFilters {
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
  numPages?: number; // Number of pages to fetch (10 results per page)
}

export interface JSearchJob {
  job_id: string;
  employer_name: string;
  employer_logo?: string;
  employer_website?: string;
  employer_company_type?: string;
  job_publisher?: string;
  job_id_urn?: string;
  job_title: string;
  job_description: string;
  job_apply_link: string;
  job_apply_is_direct?: boolean;
  job_apply_quality_score?: number;
  job_city?: string;
  job_state?: string;
  job_country?: string;
  job_latitude?: number;
  job_longitude?: number;
  job_benefits?: string[];
  job_google_link?: string;
  job_offer_expiration_datetime_utc?: string;
  job_offer_expiration_timestamp?: number;
  job_required_experience?: {
    no_experience_required: boolean;
    required_experience_in_months: number | null;
    experience_mentioned: boolean;
    experience_preferred: boolean;
  };
  job_required_skills?: string[];
  job_required_education?: {
    postgraduate_degree: boolean;
    professional_certification: boolean;
    high_school: boolean;
    associates_degree: boolean;
    bachelors_degree: boolean;
    degree_mentioned: boolean;
    degree_preferred: boolean;
    professional_certification_mentioned: boolean;
  };
  job_experience_in_place_of_education?: boolean;
  job_min_salary?: number | null;
  job_max_salary?: number | null;
  job_salary_currency?: string | null;
  job_salary_period?: string | null;
  job_highlights?: {
    Qualifications?: string[];
    Responsibilities?: string[];
    Benefits?: string[];
  };
  job_job_title?: string;
  job_posting_language?: string;
  job_onet_soc?: string;
  job_onet_job_zone?: string;
  job_is_remote: boolean;
  job_employment_type: string;
  job_posted_at_timestamp?: number;
  job_posted_at_datetime_utc?: string;
}

export interface JSearchResponse {
  status: string;
  request_id: string;
  data: JSearchJob[];
}

export async function searchJobs(
  filters: JSearchFilters,
): Promise<JSearchJob[]> {
  if (!RAPIDAPI_KEY) {
    throw new Error("RAPIDAPI_KEY is not defined in environment variables");
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: Record<string, any> = {
      query: filters.query,
      num_pages: filters.numPages || 1,
    };

    if (filters.location) params.location = filters.location;
    if (filters.remoteJobsOnly) params.remote_jobs_only = "true";
    if (filters.employmentTypes?.length) {
      params.employment_types = filters.employmentTypes.join(",");
    }
    if (filters.jobRequirements?.length) {
      params.job_requirements = filters.jobRequirements.join(",");
    }
    if (filters.datePosted && filters.datePosted !== "all") {
      params.date_posted = filters.datePosted;
    }

    const response = await axios.get<JSearchResponse>(`${BASE_URL}/search`, {
      params,
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
      },
    });

    return response.data.data || [];
  } catch (error) {
    console.error("JSearch API error:", error);
    // Return empty array instead of throwing to avoid breaking the UI completely if API fails
    // But re-throwing might be better for handling specific error states in the UI
    throw new Error("Failed to fetch jobs from JSearch API");
  }
}
