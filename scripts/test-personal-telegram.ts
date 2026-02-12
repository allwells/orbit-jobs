#!/usr/bin/env bun

/**
 * Quick test script to send a message to your personal Telegram account
 * This verifies the bot works before testing with groups
 */

import TelegramBot from "node-telegram-bot-api";

const token = process.env.TELEGRAM_BOT_TOKEN;
const personalUserId = "1054082052"; // Your personal user ID from RawDataBot

if (!token) {
  console.error("❌ TELEGRAM_BOT_TOKEN not found");
  process.exit(1);
}

async function testPersonalMessage() {
  try {
    const bot = new TelegramBot(token!, { polling: false });

    console.log("📤 Sending test message to your personal Telegram...");
    console.log(`   User ID: ${personalUserId}\n`);

    const message = `✅ *Bot Test Successful\\!*\\n\\nThe bot is working correctly\\. You can now add it to your group\\.`;

    await bot.sendMessage(personalUserId, message, {
      parse_mode: "MarkdownV2",
    });

    console.log("✅ Message sent! Check your Telegram DMs.\n");
    console.log("Next steps:");
    console.log("1. Verify you received the message");
    console.log("2. Add @OrbitJobsBot to your group");
    console.log("3. Test again with the group Chat ID\n");
  } catch (error: any) {
    console.error("❌ Failed:", error.message);

    if (error.message?.includes("bot can't initiate")) {
      console.log("\n💡 You need to start a conversation with the bot first:");
      console.log("   1. Open Telegram");
      console.log("   2. Search for @OrbitJobsBot");
      console.log("   3. Click START or send /start");
      console.log("   4. Run this script again\n");
    }
  }
}

testPersonalMessage();
