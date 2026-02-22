"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function saveJobFetchConfigAction(config: {
  search_query: string;
  location?: string;
  remote_only?: boolean;
  employment_types?: string[];
  salary_min?: number;
  date_posted?: string;
  num_results?: number;
  provider?: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  try {
    // Check if default config exists
    const existingResult = await db.query(
      "SELECT id FROM job_fetch_config WHERE user_id = $1 AND is_default = true",
      [userId],
    );

    const payload = {
      search_query: config.search_query,
      location: config.location,
      remote_only: config.remote_only,
      employment_types: config.employment_types,
      salary_min: config.salary_min ? Math.round(config.salary_min) : undefined,
      date_posted: config.date_posted,
      num_results: config.num_results
        ? Math.round(config.num_results)
        : undefined,
      provider: config.provider,
      updated_at: new Date().toISOString(),
    };

    if (existingResult.rows.length > 0) {
      // Update
      const query = `
        UPDATE job_fetch_config
        SET
          search_query = $1,
          location = $2,
          remote_only = $3,
          employment_types = $4,
          salary_min = $5,
          date_posted = $6,
          num_results = $7,
          provider = $8,
          updated_at = $9
        WHERE id = $10
      `;
      await db.query(query, [
        payload.search_query,
        payload.location,
        payload.remote_only,
        payload.employment_types,
        payload.salary_min,
        payload.date_posted,
        payload.num_results,
        payload.provider,
        payload.updated_at,
        existingResult.rows[0].id,
      ]);
    } else {
      // Insert
      const query = `
        INSERT INTO job_fetch_config (
          user_id, search_query, location, remote_only, employment_types,
          salary_min, date_posted, num_results, provider, is_default, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `;
      await db.query(query, [
        userId,
        payload.search_query,
        payload.location,
        payload.remote_only,
        payload.employment_types,
        payload.salary_min,
        payload.date_posted,
        payload.num_results,
        payload.provider,
        true, // is_default
        payload.updated_at,
      ]);
    }

    revalidatePath("/jobs");
    return { success: true };
  } catch (error) {
    console.error("Failed to save config:", error);
    throw new Error("Failed to save configuration");
  }
}
