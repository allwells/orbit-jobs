"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/kysely";
import { getRateLimitStatus } from "@/lib/x-api";
import { revalidatePath } from "next/cache";

export async function verifyXConnectionAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const status = await getRateLimitStatus();
    if (!status) throw new Error("Connection failed");
    return { success: true, message: "Connection successful!", data: status };
  } catch (error) {
    return {
      success: false,
      message: "Connection failed. Check your API keys.",
    };
  }
}

export async function getDefaultJobFetchConfigAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Find default config
  const config = await db
    .selectFrom("job_fetch_config")
    .selectAll()
    .where("user_id", "=", session.user.id)
    .where("is_default", "=", true)
    .executeTakeFirst();

  return config || null;
}

export async function upsertDefaultJobFetchConfigAction(data: {
  search_query: string;
  location: string;
  remote_only: boolean;
  salary_min: number;
  num_results: number;
  date_posted: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const {
    search_query,
    location,
    remote_only,
    salary_min,
    num_results,
    date_posted,
  } = data;

  // Check if default exists
  const existing = await db
    .selectFrom("job_fetch_config")
    .select("id")
    .where("user_id", "=", session.user.id)
    .where("is_default", "=", true)
    .executeTakeFirst();

  if (existing) {
    await db
      .updateTable("job_fetch_config")
      .set({
        search_query,
        location,
        remote_only,
        salary_min,
        num_results,
        date_posted,
        updated_at: new Date().toISOString(),
      })
      .where("id", "=", existing.id)
      .execute();
  } else {
    await db
      .insertInto("job_fetch_config")
      .values({
        id: crypto.randomUUID(),
        user_id: session.user.id,
        search_query,
        location,
        remote_only,
        salary_min,
        num_results,
        date_posted,
        is_default: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .execute();
  }

  revalidatePath("/settings");
  return { success: true };
}
