/** Status of a job in the pipeline */
export type JobStatus =
  | "pending"
  | "draft"
  | "approved"
  | "posted"
  | "rejected";

/** Work mode for a job listing */
export type WorkMode = "remote" | "on-site" | "hybrid" | null;

/** Core job listing scraped from LinkedIn */
export interface Job {
  id: string;
  linkedin_job_id: string;
  title: string;
  company: string;
  salary: string | null;
  url: string;
  location: string | null;
  work_mode: WorkMode;
  /** Full job description scraped separately */
  description: string | null;

  /** AI-generated hook tweet (no link) */
  ai_hook: string | null;
  /** AI-generated thread content (JSON/array) */
  ai_thread: string[] | null;
  /** AI-generated reply/link tweet */
  ai_reply: string | null;
  /** AI analysis/notes */
  ai_analysis: string | null;

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

/** Twitter/X post tracking */
export interface TwitterPost {
  id: string;
  job_id: string;
  tweet_id: string | null;
  posted_at: string;
  status: "success" | "failed";
  error_message: string | null;
}

/** Twitter/X analytics data */
export interface TwitterAnalytics {
  postsThisMonth: number;
  remainingPosts: number;
  limit: number;
  recentPosts: TwitterPost[];
}
