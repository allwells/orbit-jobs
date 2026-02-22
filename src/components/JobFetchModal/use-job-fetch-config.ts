import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { saveJobFetchConfigAction } from "@/app/actions/config-actions";
import { DEFAULT_CONFIG } from "./constants";
import type { JobFetchConfig } from "./types";

export function useJobFetchConfig() {
  const { user } = useAuth();
  const [config, setConfig] = useState<JobFetchConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [lastRunStats, setLastRunStats] = useState<{
    last_run_at: string | null;
    last_run_results_count: number | null;
    last_run_new_jobs: number | null;
    last_run_duplicates: number | null;
  } | null>(null);

  const fetchConfig = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("job_fetch_config")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_default", true)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching job config:", error);
      }

      if (data) {
        setConfig({
          search_query: data.search_query,
          location: data.location || "",
          remote_only: data.remote_only ?? true,
          employment_types: data.employment_types || [],
          salary_min: data.salary_min || undefined,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          date_posted: (data.date_posted as any) || "3days",
          num_results: data.num_results || 20,
          provider: (data.provider as any) || "jsearch",
        });

        setLastRunStats({
          last_run_at: data.last_run_at,
          last_run_results_count: data.last_run_results_count,
          last_run_new_jobs: data.last_run_new_jobs,
          last_run_duplicates: data.last_run_duplicates,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const saveConfig = async (newConfig: JobFetchConfig) => {
    if (!user) return;

    try {
      await saveJobFetchConfigAction({
        search_query: newConfig.search_query,
        location: newConfig.location,
        remote_only: newConfig.remote_only,
        employment_types: newConfig.employment_types,
        salary_min: newConfig.salary_min,
        date_posted: newConfig.date_posted,
        num_results: newConfig.num_results,
        provider: newConfig.provider,
      });

      setConfig(newConfig);
    } catch (error) {
      console.error("Failed to save config:", error);
      throw error;
    }
  };

  return {
    config,
    loading,
    lastRunStats,
    setConfig, // Allow local updates
    saveConfig, // Persist updates
    refreshConfig: fetchConfig,
  };
}
