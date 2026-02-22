import { auth } from "../src/lib/auth";

const USERNAME = process.env.ADMIN_USERNAME;
const PASSWORD = process.env.ADMIN_PASSWORD;

async function main() {
  console.log("Testing Auth Initialization...");
  try {
    // Just accessing auth object might be enough if it initializes synchronously?
    // BetterAuth usually initializes immediately.
    console.log("Auth object:", !!auth);

    // Try to sign in programmatically (server-side)
    // Note: auth.api endpoints usually return a Response object or throw.
    // We need to mock a request context or use distinct function if available.
    // Let's try to verify if we can match the password using the same internal logic?
    // Or just invoke the endpoint handler?

    console.log("\n--- Attempting Direct API Call ---");
    const response = await auth.api.signInUsername({
      body: {
        username: USERNAME!,
        password: PASSWORD!,
      },
      asResponse: false, // If true, returns Response object. If false, returns data/error (depending on version)
    });

    console.log("Sign-in Result:", response);

    console.log("Initialization successful (no crash yet).");
  } catch (error) {
    console.error("Auth Initialization/Call Failed:", error);
    if (error instanceof Error && "stack" in error) {
      console.error(error.stack);
    }
  }
}

main();
