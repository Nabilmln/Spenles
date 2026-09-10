"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { friends } from "@/db/schema";
import { requireSessionUser } from "@/lib/auth/require-session";
import { friendIdSchema, friendNameSchema } from "../schemas/friend";

export type FriendActionState = {
  error?: string;
  success?: string;
};

export async function createFriendAction(
  _state: FriendActionState,
  formData: FormData,
): Promise<FriendActionState> {
  const user = await requireSessionUser();
  const parsed = friendNameSchema.safeParse(formData.get("name"));
  if (!parsed.success) {
    const formErrors = parsed.error.flatten().formErrors;
    return { error: formErrors[0] ?? "Invalid name." };
  }

  const existing = await db
    .select({ id: friends.id })
    .from(friends)
    .where(and(eq(friends.userId, user.id), eq(friends.name, parsed.data)))
    .limit(1);

  if (existing.length > 0) {
    return { error: "A friend with this name already exists." };
  }

  await db.insert(friends).values({
    userId: user.id,
    name: parsed.data,
  });

  revalidatePath("/split-bills");
  return { success: "Friend added." };
}

export async function updateFriendAction(
  _state: FriendActionState,
  formData: FormData,
): Promise<FriendActionState> {
  const user = await requireSessionUser();
  const id = friendIdSchema.safeParse(formData.get("id"));
  const parsed = friendNameSchema.safeParse(formData.get("name"));
  if (!id.success || !parsed.success) {
    return { error: "Invalid name or friend." };
  }

  const existing = await db
    .select({ id: friends.id })
    .from(friends)
    .where(and(eq(friends.userId, user.id), eq(friends.name, parsed.data)))
    .limit(1);

  if (existing.length > 0 && existing[0].id !== id.data) {
    return { error: "A friend with this name already exists." };
  }

  const updated = await db
    .update(friends)
    .set({ name: parsed.data, updatedAt: new Date() })
    .where(and(eq(friends.id, id.data), eq(friends.userId, user.id)))
    .returning({ id: friends.id });

  if (updated.length === 0) {
    return { error: "Friend not found." };
  }

  revalidatePath("/split-bills");
  return { success: "Friend saved." };
}

export async function deleteFriendAction(
  friendId: string,
): Promise<{ ok: boolean }> {
  const user = await requireSessionUser();
  const parsed = friendIdSchema.safeParse(friendId);
  if (!parsed.success) return { ok: false };

  await db
    .delete(friends)
    .where(and(eq(friends.id, parsed.data), eq(friends.userId, user.id)));

  revalidatePath("/split-bills");
  return { ok: true };
}
