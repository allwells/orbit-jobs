import { db } from "./src/lib/kysely";

async function main() {
  try {
    await db.schema
      .alterTable("job_fetch_config")
      .addColumn("provider", "varchar(50)", (col) => col.defaultTo("jsearch"))
      .execute();
    console.log("Migration complete: added provider to job_fetch_config");
  } catch (err) {
    console.error("Migration failed:", err);
  }
  process.exit(0);
}

main();
