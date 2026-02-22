import { searchJobs } from "../src/lib/jsearch";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function verifyJSearch() {
  console.log("🔍 Verifying JSearch API Integration...");

  if (!process.env.RAPIDAPI_KEY) {
    console.error("❌ RAPIDAPI_KEY is missing from .env.local");
    process.exit(1);
  }

  console.log("✅ API Key found.");

  try {
    console.log(
      "📡 Sending test request to JSearch API (Query: 'Node.js Developer', Limit: 1 page)...",
    );

    // NOTE: This will consume 1 API call from the quota.
    const jobs = await searchJobs({
      query: "Node.js Developer",
      datePosted: "week",
      numResults: 10,
    });

    console.log(`✅ Success! Fetched ${jobs.length} jobs.`);

    if (jobs.length > 0) {
      const job = jobs[0];
      console.log("\nSample Job:");
      console.log(`- Title: ${job.job_title}`);
      console.log(`- Company: ${job.employer_name}`);
      console.log(`- Location: ${job.job_city}, ${job.job_country}`);
      console.log(`- URL: ${job.job_apply_link}`);
    } else {
      console.warn("⚠️ No jobs found, but API call was successful.");
    }
  } catch (error) {
    console.error("❌ API Request Failed:", error);
    process.exit(1);
  }
}

verifyJSearch();
