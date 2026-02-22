import axios from "axios";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID!;
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

export interface TelegramMessage {
  text: string;
  parseMode?: "Markdown" | "HTML";
  disableWebPreview?: boolean;
}

export async function sendTelegramMessage(
  message: TelegramMessage,
): Promise<void> {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn(
      "Telegram Bot Token or Chat ID not configured. Skipping notification.",
    );
    return;
  }

  try {
    await axios.post(`${BASE_URL}/sendMessage`, {
      chat_id: CHAT_ID,
      text: message.text,
      parse_mode: message.parseMode || "Markdown",
      disable_web_page_preview: message.disableWebPreview ?? true,
    });
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
    // We don't throw here to prevent blocking the main flow, but we log the error
  }
}

export function formatJobNotification(
  job: {
    id: string;
    title: string;
    company: string;
    salaryMin?: number | null;
    salaryMax?: number | null;
    salaryCurrency?: string;
    location?: string | null;
    remoteAllowed: boolean;
  },
  dashboardUrl: string,
): string {
  let message = "🚀 *New Job Alert*\n\n";
  message += `*${job.title}*\n`;
  message += `${job.company}\n\n`;

  if (job.salaryMin && job.salaryMax) {
    message += `💰 $${job.salaryMin.toLocaleString()}-$${job.salaryMax.toLocaleString()} ${job.salaryCurrency || "USD"}\n`;
  } else if (job.salaryMin) {
    message += `💰 $${job.salaryMin.toLocaleString()}+ ${job.salaryCurrency || "USD"}\n`;
  }

  message += `📍 ${job.location || "Location not specified"}\n`;
  message += `🏠 ${job.remoteAllowed ? "Remote ✅" : "On-site"}\n\n`;

  const deepLink = `${dashboardUrl}/jobs?jobId=${job.id}`;
  message += `[Review in Dashboard](${deepLink})`;

  return message;
}

export function formatJobFetchSummary(
  totalFetched: number,
  newJobs: number,
  duplicates: number,
  dashboardUrl: string,
): string {
  let message = "📊 *Job Fetch Complete*\n\n";
  message += `Total fetched: ${totalFetched}\n`;
  message += `New jobs: ✅ ${newJobs}\n`;
  message += `Duplicates skipped: ⏭️ ${duplicates}\n\n`;
  message += `[View Dashboard](${dashboardUrl}/jobs)`;

  return message;
}
