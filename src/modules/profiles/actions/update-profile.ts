"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { requireSessionUser } from "@/lib/auth/require-session";
import { defaultAvatarPaths } from "@/lib/avatars";
import { profileSchema } from "../schemas/profile";

export type ProfileActionState = {
  success?: string;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function updateProfileAction(
  _state: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const user = await requireSessionUser();
  const parsed = profileSchema.safeParse({
    displayName: formData.get("displayName"),
    defaultCurrency: formData.get("defaultCurrency"),
    timezone: formData.get("timezone"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const updated = await db
    .update(profiles)
    .set({
      displayName: parsed.data.displayName,
      defaultCurrency: parsed.data.defaultCurrency,
      timezone: parsed.data.timezone,
      updatedAt: new Date(),
    })
    .where(eq(profiles.userId, user.id))
    .returning({ id: profiles.id });

  if (updated.length !== 1) {
    return { error: "Profile not found or could not be updated." };
  }

  revalidatePath("/", "layout");
  return { success: "Profile settings saved." };
}

export async function updateProfileAvatarAction(index: number): Promise<ProfileActionState> {
  const user = await requireSessionUser();
  const parsed = z.number().int().min(1).max(defaultAvatarPaths.length).safeParse(index);
  if (!parsed.success) return { error: "Choose a profile photo." };

  const updated = await db
    .update(profiles)
    .set({ avatarIndex: parsed.data, updatedAt: new Date() })
    .where(eq(profiles.userId, user.id))
    .returning({ id: profiles.id });

  if (updated.length !== 1) return { error: "Profile photo could not be updated." };
  revalidatePath("/", "layout");
  return { success: "Profile photo updated." };
}
