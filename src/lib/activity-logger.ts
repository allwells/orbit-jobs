import { supabase } from "./supabase";
import type { ActivityType } from "@/types/activity";
import type { Json } from "@/types/database";

interface LogActivityParams {
  userId: string;
  activityType: ActivityType;
  title: string;
  description: string;
  metadata?: Json;
}

export async function logActivity({
  userId,
  activityType,
  title,
  description,
  metadata = {},
}: LogActivityParams): Promise<void> {
  try {
    const { error } = await supabase.from("activities").insert({
      user_id: userId,
      activity_type: activityType,
      title,
      description,
      metadata,
    });

    if (error) {
      console.error("Supabase error logging activity:", error);
    }
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Don't throw - activity logging should never break app functionality
  }
}

// Convenience functions for common activity types
export const activityLogger = {
  logLogin: async (userId: string) => {
    await logActivity({
      userId,
      activityType: "login",
      title: "User Login",
      description: "User logged into OrbitJobs dashboard",
      metadata: {
        timestamp: new Date().toISOString(),
        user_agent:
          typeof navigator !== "undefined" ? navigator.userAgent : "Server",
      },
    });
  },

  logJobFetch: async (
    userId: string,
    metadata: {
      query: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filters: Record<string, any>;
      totalFetched: number;
      newJobs: number;
      duplicates: number;
      apiResponseTime: number;
    },
  ) => {
    await logActivity({
      userId,
      activityType: "job_fetch",
      title: "Job Fetch Completed",
      description: `Fetched ${metadata.totalFetched} jobs (${metadata.newJobs} new, ${metadata.duplicates} duplicates)`,
      metadata: metadata as unknown as Json,
    });
  },

  logJobApproved: async (userId: string, jobId: string, jobTitle: string) => {
    await logActivity({
      userId,
      activityType: "job_approved",
      title: "Job Approved",
      description: `Approved job: ${jobTitle}`,
      metadata: { job_id: jobId },
    });
  },

  logJobRejected: async (userId: string, jobId: string, jobTitle: string) => {
    await logActivity({
      userId,
      activityType: "job_rejected",
      title: "Job Rejected",
      description: `Rejected job: ${jobTitle}`,
      metadata: { job_id: jobId },
    });
  },

  logContentGenerated: async (
    userId: string,
    metadata: {
      jobId: string;
      modelUsed: string;
      tokensUsed: number;
      generationTime: number;
    },
  ) => {
    await logActivity({
      userId,
      activityType: "content_generated",
      title: "AI Content Generated",
      description: `Generated content using ${metadata.modelUsed}`,
      metadata: metadata as unknown as Json,
    });
  },

  logJobPosted: async (
    userId: string,
    metadata: {
      jobId: string;
      tweetId: string;
    },
  ) => {
    await logActivity({
      userId,
      activityType: "job_posted",
      title: "Job Posted to X",
      description: "Successfully posted job thread to @TheOrbitJobs",
      metadata: metadata as unknown as Json,
    });
  },

  logSettingsUpdated: async (userId: string, settingKey: string) => {
    await logActivity({
      userId,
      activityType: "settings_updated",
      title: "Settings Updated",
      description: `Updated setting: ${settingKey}`,
      metadata: { setting_key: settingKey },
    });
  },

  logApiError: async (
    userId: string,
    metadata: {
      endpoint: string;
      error: string;
      statusCode?: number;
    },
  ) => {
    await logActivity({
      userId,
      activityType: "api_error",
      title: "API Error",
      description: `Error calling ${metadata.endpoint}: ${metadata.error}`,
      metadata: metadata as unknown as Json,
    });
  },
};

// Server-side logger using pg
import { db } from "@/lib/db";

export async function logActivityServer({
  userId,
  activityType,
  title,
  description,
  metadata = {},
}: LogActivityParams): Promise<void> {
  try {
    const query = `
      INSERT INTO activities (user_id, activity_type, title, description, metadata)
      VALUES ($1, $2, $3, $4, $5)
    `;
    await db.query(query, [
      userId,
      activityType,
      title,
      description,
      JSON.stringify(metadata),
    ]);
  } catch (error) {
    console.error("Failed to log activity (server):", error);
  }
}
