# Telegram Bot Setup Guide

## 🎯 Current Status

✅ **Bot Token**: Valid and working (@OrbitJobsBot)  
✅ **Chat ID**: Correct (-5275501976 for group, 1054082052 for personal)  
❌ **Connection**: Bot cannot access the chat yet

## 🔧 Root Cause

The bot cannot send messages because:

1. You haven't started a conversation with the bot yet (required for ALL Telegram bots)
2. The bot hasn't been added to the group

## ✅ Solution (Step-by-Step)

### Step 1: Start the Bot (REQUIRED - Do This First!)

1. Open Telegram on your phone or desktop
2. Search for `@OrbitJobsBot`
3. Click on the bot
4. Click **START** button or type `/start` and send

> **Why?** Telegram bots cannot initiate conversations. You must start the conversation first.

### Step 2: Choose Your Notification Method

#### Option A: Personal Notifications (Recommended for Testing)

**Pros**: Simpler, instant setup  
**Cons**: Only you receive notifications

1. After completing Step 1, run the test:

   ```bash
   bun scripts/quick-test.ts
   ```

2. If successful, update `.env.local`:

   ```bash
   TELEGRAM_CHAT_ID=1054082052
   ```

3. Restart your dev server and test in the app

#### Option B: Group Notifications (For Team Use)

**Pros**: Multiple people can receive notifications  
**Cons**: Requires adding bot to group

1. Complete Step 1 first (still required!)
2. Open your Telegram group
3. Click the group name at the top
4. Click "Add Members" or "Invite to Group"
5. Search for `@OrbitJobsBot`
6. Add the bot to the group
7. Make sure the bot has permission to send messages

8. Run the test:

   ```bash
   bun scripts/quick-test.ts
   ```

9. If successful, your `.env.local` is already correct:

   ```bash
   TELEGRAM_CHAT_ID=-5275501976
   ```

10. Restart your dev server and test in the app

## 🧪 Testing

### Quick Test (After Setup)

```bash
bun scripts/quick-test.ts
```

This will test both personal and group chats and tell you which one works.

### Full Diagnostic Test

```bash
bun scripts/test-telegram.ts
```

This provides detailed information about the bot and chat configuration.

### Test in the App

1. Restart your dev server:

   ```bash
   bun dev
   ```

2. Go to Settings page: http://localhost:3000/settings

3. Scroll to "Telegram Notifications"

4. Click "Test Notification"

5. Check your Telegram for the test message

## 🐛 Troubleshooting

### Error: "chat not found"

**For Personal Chat:**

- Did you send `/start` to @OrbitJobsBot?
- Are you using the correct user ID (1054082052)?

**For Group Chat:**

- Did you send `/start` to @OrbitJobsBot first?
- Did you add @OrbitJobsBot to the group?
- Is the Chat ID correct (-5275501976)?
- Does the bot have permission to send messages in the group?

### Error: "bot can't initiate conversation"

- You must send `/start` to the bot first
- Open Telegram → Search @OrbitJobsBot → Click START

### Error: "bot was kicked from the group"

- Re-add @OrbitJobsBot to the group
- Make sure you don't remove it accidentally

## 📝 Summary

1. **Send `/start` to @OrbitJobsBot** (REQUIRED FIRST STEP)
2. **Choose**: Personal (easier) or Group (for team)
3. **For Group**: Add bot to the group
4. **Run**: `bun scripts/quick-test.ts`
5. **Update**: `.env.local` if needed
6. **Test**: In the app at /settings

## 🎉 Success Indicators

You'll know it's working when:

- ✅ `quick-test.ts` shows "SUCCESS!"
- ✅ You receive a test message in Telegram
- ✅ The app shows "Test notification sent successfully"
- ✅ You see the message in your Telegram chat

## 📞 Need Help?

If you're still having issues after following all steps:

1. Run `bun scripts/test-telegram.ts` and share the output
2. Verify you completed Step 1 (sending /start to the bot)
3. Check that the bot is actually in the group (you should see it in the members list)
