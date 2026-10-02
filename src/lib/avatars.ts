export const defaultAvatarPaths = [
  "/avatars/default-1.png",
  "/avatars/default-2.png",
  "/avatars/default-3.png",
  "/avatars/default-4.png",
  "/avatars/default-5.png",
] as const;

export function avatarIndexForId(id: string): number {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  }
  return (hash % defaultAvatarPaths.length) + 1;
}

export function avatarPath(index: number): string {
  return defaultAvatarPaths[index - 1] ?? defaultAvatarPaths[0];
}
