import type { Database } from "./database";

export type Job = Database["public"]["Tables"]["jobs"]["Row"];
export type JobInsert = Database["public"]["Tables"]["jobs"]["Insert"];
export type JobUpdate = Database["public"]["Tables"]["jobs"]["Update"];

export type JobStatus = "pending" | "approved" | "rejected" | "posted";

export interface JobFilterParams {
  search?: string;
  status?: JobStatus[];
  remote?: "all" | "remote" | "onsite"; // hybrid not supported by DB yet
  salaryMin?: number;
  salaryMax?: number;
  dateAdded?: "all" | "today" | "7days" | "30days" | "90days";
  employmentTypes?: string[];
  sortBy?: string;
}
