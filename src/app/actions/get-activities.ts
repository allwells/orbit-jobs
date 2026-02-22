"use server";

import { db } from "@/lib/kysely";
import type { Database } from "@/types/database";

type Activity = Database["public"]["Tables"]["activities"]["Row"];

export async function getActivitiesAction(
  userId?: string,
  typeFilter?: string | null,
): Promise<Activity[]> {
  try {
    let query = db
      .selectFrom("activities")
      .selectAll()
      .orderBy("created_at", "desc")
      .limit(50);

    if (userId) {
      query = query.where("user_id", "=", userId);
    }

    if (typeFilter) {
      query = query.where("activity_type", "=", typeFilter);
    }

    const activities = await query.execute();
    return activities as Activity[];
  } catch (error) {
    console.error("Error fetching activities:", error);
    return [];
  }
}
