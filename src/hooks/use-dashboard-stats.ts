import { useState, useEffect } from "react";
import {
  getDashboardStatsAction,
  type DashboardStats,
} from "@/app/actions/dashboard-actions";

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: { value: 0, trend: 0 },
    pendingReview: { value: 0, trend: 0 },
    approved: { value: 0, trend: 0 },
    rejected: { value: 0, trend: 0 },
    postedToX: { value: 0, trend: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const data = await getDashboardStatsAction();
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, loading };
}
