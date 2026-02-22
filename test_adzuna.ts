import axios from "axios";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const ADZUNA_API_ID = process.env.ADZUNA_API_ID;
  const ADZUNA_API_KEY = process.env.ADZUNA_API_KEY;
  const BASE_URL = "https://api.adzuna.com/v1/api/jobs";

  try {
    console.log("Testing with:", { ADZUNA_API_ID, ADZUNA_API_KEY });
    const response = await axios.get(`${BASE_URL}/us/search/1`, {
      params: {
        app_id: ADZUNA_API_ID,
        app_key: ADZUNA_API_KEY,
        results_per_page: 10,
        what: "react",
      },
    });
    console.log("Success!", response.data.count);
  } catch (error: any) {
    console.error("Error:");
    if (error.response) {
      console.error(error.response.status);
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
  }
}
main();
