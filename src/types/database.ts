/** Status of a job in the pipeline */
export type JobStatus = "pending" | "approved" | "posted" | "rejected";

/** Core job listing scraped from LinkedIn */
export interface Job {
  id: string;
  linkedin_job_id: string;
  title: string;
  company: string;
  salary: string | null;
  url: string;
  location: string | null;

  /** AI-generated hook tweet (no link) */
  ai_hook: string | null;
  /** AI-generated reply tweet (with link) */
  ai_reply: string | null;

  status: JobStatus;
  posted_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Key-value settings store */
export interface Setting {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

/** Activity / audit log entry */
export type LogType =
  | "scrape"
  | "ai_generate"
  | "post"
  | "notification"
  | "error";

export interface Log {
  id: string;
  type: LogType;
  message: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
