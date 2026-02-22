export interface JobFetchConfig {
  search_query: string;
  location: string;
  remote_only: boolean;
  employment_types: string[];
  salary_min: number | undefined;
  date_posted: "all" | "today" | "3days" | "week" | "month";
  num_results: number;
  provider: "jsearch" | "adzuna" | "remotive" | "remoteok";
}
