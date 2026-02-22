import type { JobFetchConfig } from "./types";

export const DEFAULT_CONFIG: JobFetchConfig = {
  search_query: "",
  location: "",
  remote_only: true,
  employment_types: ["FULLTIME", "CONTRACTOR"],
  salary_min: undefined,
  date_posted: "3days",
  num_results: 20,
};

export const EMPLOYMENT_TYPES = [
  { value: "FULLTIME", label: "Full-time" },
  { value: "CONTRACTOR", label: "Contract" },
  { value: "PARTTIME", label: "Part-time" },
  { value: "INTERN", label: "Internship" },
];

export const DATE_POSTED_OPTIONS = [
  { value: "all", label: "Any time" },
  { value: "today", label: "Past 24 hours" },
  { value: "3days", label: "Past 3 days" },
  { value: "week", label: "Past week" },
  { value: "month", label: "Past month" },
];
