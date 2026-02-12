import TelegramBot from "node-telegram-bot-api";
import { Job } from "@/types/database";

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

/**
 * Creates a Telegram bot instance with proper configuration
 */
function createBot(): TelegramBot {
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN not configured");
  }

  // Create bot without polling to avoid conflicts in serverless environment
  return new TelegramBot(token, { polling: false });
}

/**
 * Sends a Telegram notification when new jobs are found.
 * Includes job details and deep links to the dashboard.
 */
export async function sendJobNotification(
  jobs: Job[],
  chatId: string,
): Promise<boolean> {
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
    const bot = createBot();

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
 * Includes comprehensive diagnostics for troubleshooting.
 */
export async function sendTestNotification(chatId: string): Promise<boolean> {
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN not configured");
  }

  console.log("\n🔍 Telegram Test Notification Debug Info:");
  console.log(`   Chat ID: ${chatId}`);
  console.log(`   Chat ID Type: ${typeof chatId}`);
  console.log(`   Chat ID Length: ${chatId.length}`);
  console.log(`   Is Negative (Group): ${chatId.startsWith("-")}`);

  try {
    const bot = createBot();

    // First, try to get bot info to verify token is valid
    console.log("\n📡 Verifying bot token...");
    const botInfo = await bot.getMe();
    console.log(
      `✅ Bot verified: @${botInfo.username} (${botInfo.first_name})`,
    );

    // Try to get chat information
    console.log("\n📡 Fetching chat information...");
    try {
      const chat = await bot.getChat(chatId);
      console.log("✅ Chat found:");
      console.log(`   Type: ${chat.type}`);
      console.log(`   ID: ${chat.id}`);
      if (chat.title) console.log(`   Title: ${chat.title}`);
      if (chat.username) console.log(`   Username: @${chat.username}`);

      // Check if it's a group and if bot is a member
      if (chat.type === "group" || chat.type === "supergroup") {
        console.log("\n📋 Group chat detected. Checking bot membership...");
        try {
          const botMember = await bot.getChatMember(chatId, botInfo.id);
          console.log(`   Bot status in group: ${botMember.status}`);

          if (botMember.status === "left" || botMember.status === "kicked") {
            throw new Error(
              `Bot is not a member of this group (status: ${botMember.status}). ` +
                `Please add @${botInfo.username} to the group first.`,
            );
          }
        } catch (memberError: any) {
          if (memberError.message?.includes("not a member")) {
            throw new Error(
              `Bot @${botInfo.username} is not a member of this group. ` +
                `Please add the bot to the group first.`,
            );
          }
          throw memberError;
        }
      }
    } catch (chatError: any) {
      console.error("❌ Failed to get chat info:", chatError.message);

      if (chatError.message?.includes("chat not found")) {
        const isGroup = chatId.startsWith("-");
        const troubleshootingSteps = isGroup
          ? [
              `The chat ID ${chatId} was not found.`,
              "",
              "For GROUP CHATS:",
              `1. Add @${botInfo.username} to your group`,
              "2. Make sure the bot has permission to send messages",
              "3. Verify your Chat ID by adding @RawDataBot to the group",
              "4. The Chat ID should match exactly (including the minus sign)",
              "",
              "Note: Group IDs are negative numbers (e.g., -5275501976)",
              "Supergroup IDs start with -100 (e.g., -1005275501976)",
            ]
          : [
              `The chat ID ${chatId} was not found.`,
              "",
              "For DIRECT MESSAGES:",
              `1. Open Telegram and search for @${botInfo.username}`,
              "2. Send /start to the bot",
              "3. Get your user ID from @userinfobot",
              "4. Use that ID (positive number) as your Chat ID",
            ];

        throw new Error(troubleshootingSteps.join("\n"));
      }

      throw chatError;
    }

    // Send test message
    console.log("\n📤 Sending test message...");
    const message = `✅ *Test Notification*\\n\\nYour Telegram integration is working correctly\\!`;

    await bot.sendMessage(chatId, message, {
      parse_mode: "MarkdownV2",
    });

    console.log(`✅ Test notification sent successfully to ${chatId}\n`);
    return true;
  } catch (error: any) {
    console.error("\n❌ Test notification failed:", error.message);
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
