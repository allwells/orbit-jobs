import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { Pool } from "pg";

/**
 * BetterAuth Configuration
 * Restricted to a single admin user through disabled sign-ups
 */
export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
    signUp: {
      enabled: false, // Strictly disable public registration
    },
  },
  plugins: [username()],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  advanced: {
    cookiePrefix: "orbit-jobs",
  },
});
