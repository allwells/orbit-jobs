#!/usr/bin/env bun

/**
 * Script to test Telegram bot connection and get bot information
 * Run with: bun scripts/test-telegram.ts
 */

import TelegramBot from "node-telegram-bot-api";

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

console.log("🔍 Testing Telegram Configuration...\n");

if (!token) {
  console.error("❌ TELEGRAM_BOT_TOKEN not found in environment");
  process.exit(1);
}

if (!chatId) {
  console.error("❌ TELEGRAM_CHAT_ID not found in environment");
  process.exit(1);
}

console.log("✅ Environment variables found:");
console.log(`   Bot Token: ${token.substring(0, 10)}...`);
console.log(`   Chat ID: ${chatId}`);
console.log(`   Chat ID Type: ${typeof chatId}`);
console.log(`   Chat ID Length: ${chatId.length}\n`);

async function testBot() {
  try {
    const bot = new TelegramBot(token!, { polling: false });

    // Get bot info
    console.log("📡 Fetching bot information...");
    const botInfo = await bot.getMe();
    console.log("✅ Bot Info:");
    console.log(`   Username: @${botInfo.username}`);
    console.log(`   Name: ${botInfo.first_name}`);
    console.log(`   ID: ${botInfo.id}\n`);

    // Try to get chat info
    console.log("📡 Fetching chat information...");
    try {
      const chat = await bot.getChat(chatId!);
      console.log("✅ Chat Info:");
      console.log(`   Type: ${chat.type}`);
      console.log(`   ID: ${chat.id}`);
      if (chat.title) console.log(`   Title: ${chat.title}`);
      if (chat.username) console.log(`   Username: @${chat.username}`);
      console.log();
    } catch (error: any) {
      console.error("❌ Failed to get chat info:");
      console.error(`   Error: ${error.message}`);
      console.error(`   Code: ${error.code}\n`);

      if (error.message?.includes("chat not found")) {
        console.log("💡 Troubleshooting steps:");
        console.log("   1. For DMs: Open Telegram and send /start to your bot");
        console.log("   2. For Groups: Add the bot to your group");
        console.log("   3. Verify your Chat ID:");
        console.log("      - For DMs: Use @userinfobot to get your user ID");
        console.log(
          "      - For Groups: Use @RawDataBot in the group to get the chat ID",
        );
        console.log(
          "   4. Group IDs should start with -100 (e.g., -1001234567890)",
        );
        console.log("   5. User IDs are positive numbers (e.g., 123456789)\n");
      }
    }

    // Try to send a test message
    console.log("📤 Attempting to send test message...");
    try {
      const message = `✅ *Test Notification*\\n\\nYour Telegram integration is working correctly\\!`;
      await bot.sendMessage(chatId!, message, {
        parse_mode: "MarkdownV2",
      });
      console.log("✅ Test message sent successfully!\n");
    } catch (error: any) {
      console.error("❌ Failed to send test message:");
      console.error(`   Error: ${error.message}`);
      console.error(`   Code: ${error.code}\n`);
    }
  } catch (error: any) {
    console.error("❌ Unexpected error:");
    console.error(error);
    process.exit(1);
  }
}

testBot();
