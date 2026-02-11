import TelegramBot from "node-telegram-bot-api";
import { Job } from "@/types/database";

/**
 * Sends a Telegram notification when new jobs are found.
 * Includes job details and deep links to the dashboard.
 */
export async function sendJobNotification(
  jobs: Job[],
  chatId: string,
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.error("TELEGRAM_BOT_TOKEN not configured");
    return false;
  }

  if (!chatId) {
    console.warn("No Telegram chat ID provided, skipping notification");
    return false;
  }

  if (jobs.length === 0) {
    return true; // Nothing to notify
  }

  try {
    const bot = new TelegramBot(token);

    // Build the message
    const jobCount = jobs.length;
    const emoji = jobCount === 1 ? "🎯" : "🎯";
    let message = `${emoji} *New Job${jobCount > 1 ? "s" : ""} Found!* (${jobCount})\\n\\n`;

    // Add up to 5 jobs to the message (to avoid hitting Telegram's message length limit)
    const displayJobs = jobs.slice(0, 5);

    displayJobs.forEach((job, index) => {
      const num = index + 1;
      message += `*${num}\\. ${escapeMarkdown(job.title)}*\\n`;
      message += `   🏢 ${escapeMarkdown(job.company)}\\n`;

      if (job.salary) {
        message += `   💰 ${escapeMarkdown(job.salary)}\\n`;
      }

      if (job.location) {
        message += `   📍 ${escapeMarkdown(job.location)}\\n`;
      }

      if (job.work_mode) {
        const modeEmoji =
          job.work_mode === "remote"
            ? "🏠"
            : job.work_mode === "hybrid"
              ? "🔀"
              : "🏢";
        message += `   ${modeEmoji} ${escapeMarkdown(job.work_mode)}\\n`;
      }

      // Deep link to dashboard
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const deepLink = `${baseUrl}/queue?job=${job.id}`;
      message += `   [🔗 View in Dashboard](${deepLink})\\n\\n`;
    });

    if (jobs.length > 5) {
      message += `_\\.\\.\\. and ${jobs.length - 5} more job${jobs.length - 5 > 1 ? "s" : ""}_\\n`;
    }

    // Send the message
    await bot.sendMessage(chatId, message, {
      parse_mode: "MarkdownV2",
      disable_web_page_preview: true,
    });

    console.log(`✅ Telegram notification sent to ${chatId}`);
    return true;
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
    return false;
  }
}

/**
 * Sends a test notification to verify Telegram configuration.
 */
export async function sendTestNotification(chatId: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN not configured");
  }

  try {
    const bot = new TelegramBot(token);
    const message = `✅ *Test Notification*\\n\\nYour Telegram integration is working correctly\\!`;

    await bot.sendMessage(chatId, message, {
      parse_mode: "MarkdownV2",
    });

    return true;
  } catch (error) {
    console.error("Failed to send test notification:", error);
    throw error;
  }
}

/**
 * Escapes special characters for Telegram MarkdownV2.
 */
function escapeMarkdown(text: string): string {
  // MarkdownV2 requires escaping: _ * [ ] ( ) ~ ` > # + - = | { } . !
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}
