const defaultAvatars = [
  "/avatars/default-1.png",
  "/avatars/default-2.png",
  "/avatars/default-3.png",
  "/avatars/default-4.png",
  "/avatars/default-5.png",
] as const;

export function defaultProfileAvatar(userId: string): string {
  let hash = 0;
  for (let index = 0; index < userId.length; index += 1) {
    hash = (hash * 31 + userId.charCodeAt(index)) >>> 0;
  }
  return defaultAvatars[hash % defaultAvatars.length];
}
