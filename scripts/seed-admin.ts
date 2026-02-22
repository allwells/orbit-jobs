import { createClient } from "@supabase/supabase-js";
import { auth } from "../src/lib/auth"; // Import auth instance to use API
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "root";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  console.error("Error: ADMIN_PASSWORD not found in .env.local");
  process.exit(1);
}

async function seedAdmin() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    console.log(`Cleaning up existing user: ${ADMIN_USERNAME}...`);
    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .eq("username", ADMIN_USERNAME);

    if (deleteError) {
      console.error("Cleanup warning (might not exist):", deleteError.message);
    }

    console.log("Creating admin user via BetterAuth API...");
    // Use signUpEmail which handles password hashing and schema mapping automatically
    const res = await auth.api.signUpEmail({
      body: {
        email: "admin@orbitjobs.com",
        password: ADMIN_PASSWORD!,
        name: "Admin User",
        username: ADMIN_USERNAME, // Pass username to be stored
      },
    });

    console.log("Admin user created successfully via API");
  } catch (error) {
    if (error instanceof Error && error.message.includes("APIError")) {
      console.log("User might already exist or API error:", error.message);
      // If it failed, it might mean email is taken, let's try to delete by email too?
    } else {
      console.error("Failed to seed admin:", error);
    }
  }
}

seedAdmin();
