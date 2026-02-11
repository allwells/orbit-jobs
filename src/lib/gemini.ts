import { GoogleGenerativeAI } from "@google/generative-ai";
import { Job } from "@/types/database";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface AIContent {
  hook: string;
  thread: string[];
  reply: string;
  analysis: string;
}

/**
 * Generates viral X (Twitter) content for a tech job using Gemini.
 */
export async function generateJobContent(job: Job): Promise<AIContent> {
  const prompt = `
  You are an expert tech recruiter and viral social media strategist specializing in Developer Relations and Engineering roles.
  Your goal is to take a raw job posting and transform it into a high-engagement Twitter/X thread that developers will actually want to read.

  Analyze the following job details:
  Title: ${job.title}
  Company: ${job.company}
  Salary: ${job.salary || "Not specified"}
  Location: ${job.location || "Remote/Flexible"}
  Work Mode: ${job.work_mode || "Unknown"}
  URL: ${job.url}
  
  (Note: Do not include the URL in the hook or thread body. Only put it in the final reply/link tweet).
  
  Generate a JSON response with the following fields:
  1. "hook": A single, punchy tweet (max 280 chars) that stops the scroll. Use a controversial take, a salary reveal, or a question. No hashtags.
  2. "thread": An array of 3-5 tweets (strings) that elaborate on the role. Focus on:
     - Tech stack & Engineering culture
     - Salary & Benefits (emphasize high pay if applicable)
     - Impact & Mission
     - "Why apply?"
  3. "reply": A professional and clean final tweet that includes the application link and a Call to Action (CTA). Example: "Apply here: [URL] 🚀 #techjobs"
  4. "analysis": A brief internal note (1-2 sentences) on why this job is a "good catch" or any red flags.
  
  Output purely valid JSON.
  `;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    });

    const response = result.response;
    const text = response.text();

    // Parse JSON safely
    const data = JSON.parse(text) as AIContent;
    return data;
  } catch (error) {
    console.error("Gemini generation failed:", error);
    throw new Error("Failed to generate content");
  }
}
