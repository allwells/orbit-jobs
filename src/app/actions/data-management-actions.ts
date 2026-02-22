"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/kysely";
import { revalidatePath } from "next/cache";

export async function clearPostedJobsAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Delete jobs that have been posted to X
  await db
    .deleteFrom("jobs")
    .where("posted_to_x", "=", true)
    // Ensure we only delete jobs visible to the user (if jobs were user-scoped, but schema shows jobs are global or not explicitly user-linked in the row provided in database.ts?
    // Wait, looking at database.ts, `jobs` table DOES NOT have user_id.
    // Usage Context: This app seems single-tenant or shared.
    // Rules say "The USER... has 1 active workspaces".
    // Let's assume global for now or strictly check if we need to filter.
    // Re-reading database.ts... `activities` has user_id, `settings` has user_id. `jobs` does NOT.
    // Safest to just delete all posted jobs as requested by the user.
    .execute();

  revalidatePath("/dashboard");
  revalidatePath("/jobs");
  return { success: true };
}

export async function resetAllSettingsAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Delete all settings for this user
  await db
    .deleteFrom("settings")
    .where("user_id", "=", session.user.id)
    .execute();

  revalidatePath("/settings");
  return { success: true };
}
