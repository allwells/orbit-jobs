import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";
import { notifications } from "@mantine/notifications";

type Activity = Database["public"]["Tables"]["activities"]["Row"];

import { getActivitiesAction } from "@/app/actions/get-activities";

export function useActivities(
  userId?: string,
  typeFilter?: string | null,
  initialData?: Activity[],
) {
  const [activities, setActivities] = useState<Activity[]>(initialData || []);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<Error | null>(null);

  const fetchActivities = useCallback(async () => {
    // If we have initial data and haven't fetched yet, we might want to skip?
    // But for now, let's allow manual refetch override
    try {
      setLoading(true);
      const data = await getActivitiesAction(userId, typeFilter);
      setActivities(data);
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
      notifications.show({
        title: "Error",
        message: "Failed to load activity feed",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, [userId, typeFilter]);

  useEffect(() => {
    if (!initialData) {
      fetchActivities();
    }

    // Subscribe to realtime changes
    // If userId is present, filter by it. If not, listen to all (if RLS allows or public)
    const filterConfig = userId
      ? { filter: `user_id=eq.${userId}` }
      : undefined;

    const subscription = supabase
      .channel("activities_channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activities",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(filterConfig as any),
        },
        (payload) => {
          const newActivity = payload.new as Activity;
          if (typeFilter && newActivity.activity_type !== typeFilter) {
            return;
          }
          setActivities((prev) => [newActivity, ...prev]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId, fetchActivities, typeFilter]);

  return { activities, loading, error, refetch: fetchActivities };
}
