"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { requireSessionUser } from "@/lib/auth/require-session";
import { profileSchema, themeSchema } from "../schemas/profile";

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
    theme: formData.get("theme"),
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
      theme: parsed.data.theme,
      updatedAt: new Date(),
    })
    .where(eq(profiles.userId, user.id))
    .returning({ id: profiles.id });

  if (updated.length !== 1) {
    return { error: "Profil tidak ditemukan atau tidak dapat diperbarui." };
  }

  const cookieStore = await cookies();
  cookieStore.set("spenles-theme", parsed.data.theme, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/", "layout");
  return { success: "Pengaturan profil tersimpan." };
}

export async function setThemeAction(theme: string) {
  const parsed = themeSchema.safeParse(theme);
  if (!parsed.success) return;

  const user = await requireSessionUser();
  await db
    .update(profiles)
    .set({ theme: parsed.data, updatedAt: new Date() })
    .where(eq(profiles.userId, user.id));

  const cookieStore = await cookies();
  cookieStore.set("spenles-theme", parsed.data, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/", "layout");
}
