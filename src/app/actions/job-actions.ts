"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { fetchAndStoreJobs } from "@/lib/job-service";
import { db } from "@/lib/kysely";
import { revalidatePath } from "next/cache";

export async function fetchJobsAction(formData: {
  search_query: string;
  location?: string;
  remote_only?: boolean;
  employment_types?: string[];
  date_posted?: string;
  num_results: number;
  provider: "jsearch" | "adzuna" | "remotive" | "remoteok";
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const result = await fetchAndStoreJobs(session.user.id, {
    query: formData.search_query,
    location: formData.location,
    remoteJobsOnly: formData.remote_only,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    employmentTypes: formData.employment_types as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    datePosted: formData.date_posted as any,
    numResults: formData.num_results,
    provider: formData.provider,
  });

  revalidatePath("/jobs");

  // Ensure plain objects are returned to client to avoid serialization issues with Dates if any
  return JSON.parse(JSON.stringify(result));
}

export async function deleteJobAction(jobId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  await db.deleteFrom("jobs").where("id", "=", jobId).execute();

  revalidatePath("/jobs");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function deleteJobsBulkAction(jobIds: string[]) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  if (jobIds.length === 0) return { success: true };

  await db.deleteFrom("jobs").where("id", "in", jobIds).execute();

  revalidatePath("/jobs");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function updateJobsStatusBulkAction(
  jobIds: string[],
  status: "approved" | "rejected",
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  if (jobIds.length === 0) return { success: true };

  await db
    .updateTable("jobs")
    .set({ status })
    .where("id", "in", jobIds)
    .execute();

  revalidatePath("/jobs");
  revalidatePath("/dashboard");

  return { success: true };
}
