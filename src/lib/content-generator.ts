import { generateText } from "ai";
import { getAIModel, AIProvider, AIModel } from "./ai";
import type { Job } from "@/types/job";

export interface ThreadContent {
  primaryTweet: string; // Hook tweet WITHOUT link
  replyTweet: string; // Reply tweet WITH link
}

export interface ContentGenerationResult {
  content: ThreadContent;
  modelUsed: string;
  tokensUsed: number;
  generationTime: number;
}

const THREAD_GENERATION_PROMPT = `You are a viral content expert for @TheOrbitJobs on X (Twitter). Your job is to transform tech job postings into engaging, high-performing thread hooks.

CRITICAL RULES:
1. The primary tweet must be a HOOK - attention-grabbing, no link
2. The reply tweet contains the application link
3. Primary tweet must be under 250 characters
4. Reply tweet must be under 250 characters
5. Focus on: Salary (if available), Tech Stack, Company prestige, Remote status
6. Use power words: "Hiring", "Remote", "Stack", salary with currency symbol
7. Make it scannable - use emojis sparingly, line breaks strategically
8. Sound human and natural, not corporate - conversational but professional

THREAD STRUCTURE:
Primary Tweet (Hook):
- Lead with highest value point (salary, company name, or role level)
- Mention 2-3 key technologies
- Include remote status if applicable
- Create curiosity - make them want to click
- NO LINK in this tweet

Reply Tweet:
- Include the job application link
- Add "Apply here: [link]"
- Optionally add 1-2 additional selling points
- Can include relevant hashtags (#RemoteJobs #ReactJobs)

EXAMPLE:
Primary: "🚀 $180K-$220K Senior React Engineer at Stripe

Stack: React, TypeScript, Node.js, PostgreSQL
Fully remote, US-based

They're building the future of online payments..."

Reply: "Apply here: [job_link]

#RemoteJobs #ReactJobs #TechJobs"

Now generate a thread for this job:`;

export async function generateJobThread(
  job: Job,
  provider: AIProvider,
  model: AIModel,
): Promise<ContentGenerationResult> {
  const startTime = Date.now();

  try {
    const aiModel = getAIModel(provider, model);

    const jobContext = formatJobForPrompt(job);

    const { text, usage } = await generateText({
      model: aiModel,
      prompt: `${THREAD_GENERATION_PROMPT}\n\n${jobContext}`,
      temperature: 0.8,
      // maxTokens: 500, // Error: does not exist in type
    });

    const content = parseThreadResponse(text);
    const generationTime = Date.now() - startTime;

    return {
      content,
      modelUsed: `${provider}/${model}`,
      tokensUsed: usage.totalTokens || 0,
      generationTime,
    };
  } catch (error) {
    console.error("Content generation failed:", error);
    if (error instanceof Error && error.message.includes("quota")) {
      throw new Error(
        "AI Quota exceeded. Please try again in a few minutes or switch models.",
      );
    }
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to generate content. Please try again.",
    );
  }
}

function formatJobForPrompt(job: Job): string {
  let context = `Job Title: ${job.title}\n`;
  context += `Company: ${job.company}\n`;

  if (job.salary_min && job.salary_max) {
    context += `Salary: $${job.salary_min.toLocaleString()}-$${job.salary_max.toLocaleString()} ${job.salary_currency}\n`;
  } else if (job.salary_min) {
    context += `Salary: $${job.salary_min.toLocaleString()}+ ${job.salary_currency}\n`;
  }

  context += `Remote: ${job.remote_allowed ? "Yes" : "No"}\n`;
  context += `Location: ${job.location || "Not specified"}\n`;

  if (job.required_skills && job.required_skills.length > 0) {
    context += `Skills: ${job.required_skills.join(", ")}\n`;
  }

  if (job.description) {
    context += `\nDescription:\n${job.description.substring(0, 500)}...\n`;
  }

  context += `\nApplication Link: ${job.apply_url}`;

  return context;
}

function parseThreadResponse(text: string): ThreadContent {
  // Parse the AI response to extract primary and reply tweets
  // This is a simple parser - adjust based on actual AI output format

  const lines = text.split("\n").filter((line) => line.trim());

  let primaryTweet = "";
  let replyTweet = "";
  let mode: "primary" | "reply" | null = null;

  for (const line of lines) {
    if (
      line.toLowerCase().includes("primary") ||
      line.toLowerCase().includes("hook")
    ) {
      mode = "primary";
      continue;
    }
    if (line.toLowerCase().includes("reply")) {
      mode = "reply";
      continue;
    }

    if (
      mode === "primary" &&
      !line.startsWith("#") &&
      !line.toLowerCase().includes("apply")
    ) {
      primaryTweet += line + "\n";
    } else if (mode === "reply") {
      replyTweet += line + "\n";
    }
  }

  // Fallback: if parsing fails, split the content in half
  if (!primaryTweet || !replyTweet) {
    const half = Math.floor(lines.length / 2);
    primaryTweet = lines.slice(0, half).join("\n");
    replyTweet = lines.slice(half).join("\n");
  }

  return {
    primaryTweet: primaryTweet.trim(),
    replyTweet: replyTweet.trim(),
  };
}
