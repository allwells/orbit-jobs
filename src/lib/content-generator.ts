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

const THREAD_GENERATION_PROMPT = `You are a viral content expert for @TheOrbitJobs on X (Twitter). Transform tech job postings into engaging threads that highlight the most compelling details.

CRITICAL RULES:
1. Primary tweet = HOOK (attention-grabbing, NO link)
2. Reply tweet = application link
3. Primary tweet: max 260 characters
4. Reply tweet: max 230 characters
5. Extract and prioritize from job description:
   - Salary range (always lead with this if available)
   - Required skills (focus on 2-3 most important/in-demand)
   - Key tech stack (popular technologies only)
   - Benefits/perks mentioned (equity, unlimited PTO, learning budget, etc)
   - Company prestige/stage (unicorn, Series X, Fortune 500)
   - Remote/location flexibility
   - Seniority level (Senior, Staff, Principal, Lead)
6. Use power words: "Hiring", "Remote", "Stack", currency symbols
7. Scannable format: emojis sparingly, strategic line breaks
8. Tone: human and conversational, not corporate

CONTENT EXTRACTION:
From job description, identify and rank by impact:
1. Compensation (base + equity + bonus)
2. Must-have skills (look for "required" or "must have")
3. Differentiators (unique benefits, prestigious company, rare tech)
4. Growth opportunities (mentions of "mentorship", "leadership", "impact")
5. Work environment (remote policy, team size, autonomy level)

THREAD STRUCTURE:

Primary Tweet (Hook):
- Open with highest value: salary > company prestige > role level
- Include 2-3 key technical skills (prioritize in-demand tech)
- Add remote status if mentioned
- Include one standout detail from description (equity, team, product)
- Create curiosity gap - make them want details
- NO LINK

Reply Tweet:
- "Apply here: [job_link]"
- Add 1-2 unique selling points from description not in primary tweet
- Include relevant hashtags (#RemoteJobs #[PrimaryTech]Jobs #TechJobs)

EXAMPLES:

Example 1 (Salary + Skills focus):
Primary: "💰 $180K-$220K + equity | Senior React Engineer at Stripe

Stack: React, TypeScript, Node.js, PostgreSQL
Fully remote 🌍

Building payment infrastructure for millions of businesses. Seeking someone who's shipped production React at scale.

Apply below 👇"

Reply: "Apply here: [link]

#RemoteJobs #ReactJobs #TechJobs"

Example 2 (Prestige + Rare skill focus):
Primary: "🔥 Meta hiring Staff ML Engineer

Need: PyTorch, distributed training, LLM fine-tuning
$220K-$300K + RSUs

Remote-friendly. Working on next-gen AI products used by 3B+ people.

Apply below 👇"

Reply: "Apply here: [link]

#RemoteJobs #MLJobs #TechJobs"

Example 3 (Growth + Remote focus):
Primary: "🚀 Meta is hiring a Senior Software Engineer

Need: React, Node.js, TypeScript
$220K-$300K + RSUs

Fully remote 🌍

Building next-gen AI products used by 3B+ people. Seeking someone who's shipped production React at scale.

Apply below 👇"

Reply: "Apply here: [link]

#RemoteJobs #ReactJobs #TechJobs"

IMPORTANT:
- If salary not available, lead with company name or unique tech
- Extract actual benefits mentioned, don't invent them
- Match tone to job level (Senior = more technical, Junior = growth-focused)
- Only include skills explicitly mentioned in description
- If description lacks details, focus on role title + company + stack

NOTE: The job posts should not be personalized as these are job postings for companies.

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
