import type { Database } from "./database";

export type ActivityType =
  | "login"
  | "logout"
  | "job_fetch"
  | "job_approved"
  | "job_rejected"
  | "job_posted"
  | "content_generated"
  | "settings_updated"
  | "api_error";

export interface ActivityMetadata {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export type ActivityLog = Database["public"]["Tables"]["activities"]["Row"];

export interface JobFetchMetadata extends ActivityMetadata {
  query: string;
  filters: object;
  total_fetched: number;
  duplicates: number;
  new_jobs: number;
  api_response_time: number;
}

export interface ContentGeneratedMetadata extends ActivityMetadata {
  job_id: string;
  model_used: string;
  tokens_used: number;
  generation_time: number;
}

export interface JobPostedMetadata extends ActivityMetadata {
  job_id: string;
  tweet_id: string;
  engagement_metrics?: object;
}
