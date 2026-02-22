import {
  sendTelegramMessage,
  formatJobNotification,
  formatJobFetchSummary,
} from "./telegram";
import type { Job } from "@/types/job";

const DASHBOARD_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function notifyNewJob(job: Job): Promise<void> {
  try {
    const message = formatJobNotification(
      {
        id: job.id,
        title: job.title,
        company: job.company,
        salaryMin: job.salary_min || undefined,
        salaryMax: job.salary_max || undefined,
        salaryCurrency: job.salary_currency || undefined,
        location: job.location || undefined,
        remoteAllowed: job.remote_allowed || false,
      },
      DASHBOARD_URL,
    );

    await sendTelegramMessage({ text: message, parseMode: "Markdown" });
  } catch (error) {
    console.error("Failed to send job notification:", error);
    // Don't throw - notification failures shouldn't break job fetching
  }
}

export async function notifyJobFetchComplete(
  totalFetched: number,
  newJobs: number,
  duplicates: number,
): Promise<void> {
  try {
    const message = formatJobFetchSummary(
      totalFetched,
      newJobs,
      duplicates,
      DASHBOARD_URL,
    );

    await sendTelegramMessage({ text: message, parseMode: "Markdown" });
  } catch (error) {
    console.error("Failed to send fetch summary notification:", error);
  }
}

export async function notifyBatchNewJobs(jobs: Job[]): Promise<void> {
  // Send summary notification for batch
  if (jobs.length === 0) return;

  try {
    let message = `📦 *${jobs.length} New Job${jobs.length > 1 ? "s" : ""} Added*\n\n`;

    // Show first 3 jobs in notification
    const previewJobs = jobs.slice(0, 3);
    for (const job of previewJobs) {
      // Escape generic characters for Markdown if needed, but basic should work
      message += `• ${job.title} @ ${job.company}\n`;
    }

    if (jobs.length > 3) {
      message += `\n...and ${jobs.length - 3} more\n`;
    }

    message += `\n[Review All Jobs](${DASHBOARD_URL}/jobs)`;

    await sendTelegramMessage({ text: message, parseMode: "Markdown" });
  } catch (error) {
    console.error("Failed to send batch notification:", error);
  }
}
