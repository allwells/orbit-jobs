import { Kysely, PostgresDialect } from "kysely";
import { db as pool } from "./db";
import type { Database } from "@/types/database";

// Types need to be transformed from Supabase types to Kysely interface
// Kysely expects a simple interface where keys are table names and values are row types
interface KyselyDatabase {
  users: Database["public"]["Tables"]["users"]["Row"];
  jobs: Database["public"]["Tables"]["jobs"]["Row"];
  activities: Database["public"]["Tables"]["activities"]["Row"];
  settings: Database["public"]["Tables"]["settings"]["Row"];
  job_fetch_config: Database["public"]["Tables"]["job_fetch_config"]["Row"];
}

export const db = new Kysely<KyselyDatabase>({
  dialect: new PostgresDialect({
    pool,
  }),
});
