"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/kysely";
import { revalidatePath } from "next/cache";

export async function getSettingsAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const settings = await db
    .selectFrom("settings")
    .selectAll()
    .where("user_id", "=", session.user.id)
    .execute();

  // Convert array of settings to object map
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settingsMap: Record<string, any> = {};
  settings.forEach((s) => {
    settingsMap[s.setting_key] = s.setting_value;
  });

  return settingsMap;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateSettingAction(key: string, value: any) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Check if setting exists
  const existing = await db
    .selectFrom("settings")
    .select("id")
    .where("user_id", "=", session.user.id)
    .where("setting_key", "=", key)
    .executeTakeFirst();

  if (existing) {
    await db
      .updateTable("settings")
      .set({
        setting_value: value,
        updated_at: new Date().toISOString(),
      })
      .where("id", "=", existing.id)
      .execute();
  } else {
    await db
      .insertInto("settings")
      .values({
        id: crypto.randomUUID(),
        user_id: session.user.id,
        setting_key: key,
        setting_value: value,
        updated_at: new Date().toISOString(),
      })
      .execute();
  }

  revalidatePath("/settings");
  return { success: true };
}
