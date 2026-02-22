import { useState, useEffect, useCallback } from "react";
import { getJobsAction } from "@/app/actions/get-jobs";
import type { Job, JobFilterParams } from "@/types/job";

export function useJobs(
  filters: JobFilterParams,
  page: number = 1,
  pageSize: number = 25,
) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Call Server Action
      const result = await getJobsAction(filters, page, pageSize);

      // Parse result (ensure dates are handled if needed, though pg usually sends strings/dates fine)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setJobs(result.jobs as any); // Cast as any if Type mismatch on Date/string, but Job type has string for dates usually
      setTotalCount(result.totalCount);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch jobs";
      setError(errorMessage);
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    totalCount,
    loading,
    error,
    refetch: fetchJobs,
  };
}
