import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = "jsearch.p.rapidapi.com";
const BASE_URL = "https://jsearch.p.rapidapi.com";

async function debugJSearch() {
  if (!RAPIDAPI_KEY) {
    console.error("❌ RAPIDAPI_KEY is missing in .env.local");
    return;
  }

  console.log("🔑 API Key found:", RAPIDAPI_KEY.substring(0, 5) + "...");

  try {
    const params = {
      query: "Frontend Developer React Next.js",
      location: "Remote",
      remote_jobs_only: "true",
      employment_types: "FULLTIME,CONTRACTOR,PARTTIME",
      date_posted: "week",
      num_pages: 1,
      page: 1,
    };

    console.log("\n📡 Sending request to JSearch API...");
    console.log("Params:", JSON.stringify(params, null, 2));

    const response = await axios.get(`${BASE_URL}/search`, {
      params,
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
      },
    });

    console.log("\n✅ Response Status:", response.status);
    console.log("✅ Response Headers:", response.headers);

    const data = response.data;
    console.log("\n📦 Response Data Structure Keys:", Object.keys(data));

    if (data.data) {
      console.log(`\n📄 Found ${data.data.length} jobs.`);
      if (data.data.length > 0) {
        console.log("\n🔎 First Job Sample:");
        console.log(JSON.stringify(data.data[0], null, 2));
      } else {
        console.log("\n⚠️ Data array is empty.");
      }
    } else {
      console.log("\n⚠️ 'data' property is missing from response.");
      console.log("Full Response Body:", JSON.stringify(data, null, 2));
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("\n❌ API Error:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

debugJSearch();
