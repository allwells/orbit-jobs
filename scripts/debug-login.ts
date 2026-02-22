import { createClient } from "@supabase/supabase-js";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const ADMIN_USERNAME = process.env.ADMIN_USERNAME!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

async function debugLogin() {
  console.log("Debugging login...");
  console.log(`Checking user: ${ADMIN_USERNAME}`);
  console.log(`Using password: ${ADMIN_PASSWORD}`);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  // 1. Fetch user
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", ADMIN_USERNAME)
    .single();

  if (error || !user) {
    console.error("User NOT found or DB error:", error);
    return;
  }

  console.log("User found:", user.id);
  console.log("Stored hash:", user.password);

  // 2. Hash checking
  console.log("Verifying password...");
  const isValid = await verifyPassword({
    hash: user.password,
    password: ADMIN_PASSWORD,
  });
  console.log("Is password valid (using better-auth/crypto)?", isValid);

  if (!isValid) {
    console.log("Crypto mismatch! Re-hashing...");
    const newHash = await hashPassword(ADMIN_PASSWORD);
    console.log("New hash would be:", newHash);
    console.log("Stored hash is:   ", user.password);
  } else {
    console.log(
      "Crypto is CORRECT. The issue is likely in auth.ts configuration or adapter.",
    );
  }
}

debugLogin();
