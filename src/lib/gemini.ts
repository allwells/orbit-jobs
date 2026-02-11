import { GoogleGenerativeAI } from "@google/generative-ai";
import { Job } from "@/types/database";

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface AIContent {
  hook: string;
  thread: string[];
  reply: string;
  analysis: string;
}

/**
 * Generates viral X (Twitter) content for a tech job using Gemini.
 * Uses gemini-2.0-flash-exp for fast, reliable generation.
 */
export async function generateJobContent(job: Job): Promise<AIContent> {
  try {
    // Use gemini-2.0-flash-exp which is available in v1 endpoint
    // This is faster and more cost-effective than 1.5-pro
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
    });

    const prompt = `You are an expert tech recruiter and viral social media strategist specializing in Developer Relations and Engineering roles.

Your task: Transform this job posting into a high-engagement Twitter/X thread that developers will actually want to read.

Job Details:
- Title: ${job.title}
- Company: ${job.company}
- Salary: ${job.salary || "Not specified"}
- Location: ${job.location || "Remote/Flexible"}
- Work Mode: ${job.work_mode || "Unknown"}
- URL: ${job.url}

CRITICAL: Respond with ONLY a valid JSON object. No markdown, no code blocks, no extra text.

Required JSON structure:
{
  "hook": "A punchy tweet (max 280 chars) that stops the scroll",
  "thread": ["Tweet 1", "Tweet 2", "Tweet 3"],
  "reply": "Final tweet with application link and CTA",
  "analysis": "Brief internal note on job viability"
}

Guidelines:
1. hook: Use a controversial take, salary reveal, or compelling question. No hashtags.
2. thread: 3-5 tweets elaborating on tech stack, culture, salary/benefits, impact, and "why apply"
3. reply: Professional CTA with the application link
4. analysis: 1-2 sentences on why this is a good catch or any red flags

Remember: Do NOT include the URL in hook or thread. Only in the reply tweet.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    if (!text) {
      throw new Error("Empty response from AI");
    }

    // Clean up response - remove markdown code blocks if present
    text = text
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    // Parse JSON safely
    try {
      const data = JSON.parse(text) as AIContent;

      // Validate structure
      if (
        !data.hook ||
        !Array.isArray(data.thread) ||
        !data.reply ||
        !data.analysis
      ) {
        throw new Error("Invalid AI response structure");
      }

      return data;
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON. Raw text:", text);

      // Fallback: Try to extract JSON from text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const data = JSON.parse(jsonMatch[0]) as AIContent;
          if (
            !data.hook ||
            !Array.isArray(data.thread) ||
            !data.reply ||
            !data.analysis
          ) {
            throw new Error("Invalid AI response structure");
          }
          return data;
        } catch (innerError) {
          console.error("JSON extraction failed:", innerError);
        }
      }

      throw new Error("AI returned malformed data format");
    }
  } catch (error: any) {
    console.error("Gemini service error:", error);

    const errorMessage = error.message || String(error);

    // Provide helpful error messages
    if (errorMessage.includes("404")) {
      throw new Error(
        "Gemini Model Not Found. The model may not be available in your region or with your API key.",
      );
    }

    if (errorMessage.includes("429")) {
      throw new Error("Rate limit exceeded. Please try again in a moment.");
    }

    if (errorMessage.includes("401") || errorMessage.includes("403")) {
      throw new Error(
        "API Key authentication failed. Check your GEMINI_API_KEY.",
      );
    }

    throw new Error(`AI Content Engine Error: ${errorMessage}`);
  }
}
