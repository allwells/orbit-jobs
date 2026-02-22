import { useState, useCallback, useEffect } from "react";
import { notifications } from "@mantine/notifications";
import { useAuth } from "@/hooks/use-auth";

interface RateLimitStatus {
  limit: number;
  remaining: number;
  reset: number;
}

export function useXPosting() {
  const [posting, setPosting] = useState(false);
  const [rateLimit, setRateLimit] = useState<RateLimitStatus | null>(null);
  const { user } = useAuth();

  const fetchRateLimit = useCallback(async () => {
    // In a real implementation, we would fetch this from an API endpoint
    // For now, we'll simulate or add an endpoint for it if needed.
    // Actually, let's add a lightweight check or just rely on the post response headers?
    // Or better, creating a specific endpoint for rate limits is best practice.
    // For Phase 7, let's assume we might need one.
    // But to save time, we can also just return a default or mock it first.
    // Let's implement a real one later. For now, basic state.
    // UPDATE: We will implement a simple endpoint for this next.
  }, []);

  const postToX = async (
    jobId: string,
    onSuccess: (tweetUrl: string) => void,
  ) => {
    if (!user) {
      notifications.show({
        title: "Error",
        message: "You must be logged in to post",
        color: "red",
      });
      return;
    }

    try {
      setPosting(true);

      const response = await fetch(`/api/jobs/${jobId}/post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to post to X");
      }

      notifications.show({
        title: "Success",
        message: "Job posted to X successfully!",
        color: "green",
      });

      onSuccess(data.tweetUrl);
    } catch (error) {
      console.error("Posting error:", error);
      notifications.show({
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to post to X",
        color: "red",
      });
    } finally {
      setPosting(false);
    }
  };

  return {
    posting,
    postToX,
    rateLimit,
  };
}
