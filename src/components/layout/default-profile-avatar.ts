import { avatarIndexForId, avatarPath } from "@/lib/avatars";

export function defaultProfileAvatar(userId: string): string {
  return avatarPath(avatarIndexForId(userId));
}
