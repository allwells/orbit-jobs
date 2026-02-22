import { useState } from "react";
import { notifications } from "@mantine/notifications";
import type { ThreadContent } from "@/lib/content-generator";
import { AIProvider, AIModel } from "@/lib/ai";
import { useAuth } from "@/hooks/use-auth";

export function useContentGeneration() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const generateContent = async (
    jobId: string,
    provider: AIProvider,
    model: AIModel,
    onSuccess: (content: ThreadContent, tokensUsed: number) => void,
  ) => {
    try {
      setLoading(true);

      const response = await fetch(`/api/jobs/${jobId}/generate-content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider,
          model,
          userId: user?.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate content");
      }

      notifications.show({
        title: "Success",
        message: "AI content generated successfully",
        color: "green",
      });

      onSuccess(data.content, data.tokensUsed);
    } catch (error) {
      console.error("Content generation error:", error);
      notifications.show({
        title: "Error",
        message:
          error instanceof Error ? error.message : "Failed to generate content",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    generateContent,
  };
}
