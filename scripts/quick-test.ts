#!/usr/bin/env bun

/**
 * Interactive test - run this AFTER you've sent /start to @OrbitJobsBot
 */

import TelegramBot from "node-telegram-bot-api";

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error("❌ TELEGRAM_BOT_TOKEN not found");
  process.exit(1);
}

async function quickTest() {
  const bot = new TelegramBot(token!, { polling: false });

  console.log("🔍 Testing both chat options...\n");

  // Test 1: Personal chat
  console.log("📤 Test 1: Sending to your personal Telegram (1054082052)...");
  try {
    await bot.sendMessage("1054082052", "✅ Personal chat test successful!", {
      parse_mode: "Markdown",
    });
    console.log("✅ SUCCESS! Personal chat is working.\n");
  } catch (error: any) {
    console.log(`❌ FAILED: ${error.message}`);
    if (error.message?.includes("chat not found")) {
      console.log("   → You need to send /start to @OrbitJobsBot first\n");
    }
  }

  // Test 2: Group chat
  console.log("📤 Test 2: Sending to group chat (-5275501976)...");
  try {
    await bot.sendMessage("-5275501976", "✅ Group chat test successful!", {
      parse_mode: "Markdown",
    });
    console.log("✅ SUCCESS! Group chat is working.\n");
  } catch (error: any) {
    console.log(`❌ FAILED: ${error.message}`);
    if (error.message?.includes("chat not found")) {
      console.log("   → You need to add @OrbitJobsBot to the group first\n");
    }
  }

  console.log("📋 Summary:");
  console.log("   - If both failed: Send /start to @OrbitJobsBot in Telegram");
  console.log("   - If only group failed: Add @OrbitJobsBot to your group");
  console.log(
    "   - If both succeeded: Update your .env.local and test in the app!\n",
  );
}

quickTest();
