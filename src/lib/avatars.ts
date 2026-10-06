export const defaultAvatarPaths = [
  "/avatars/fox.webp",
  "/avatars/cat.webp",
  "/avatars/bear.webp",
  "/avatars/rabbit.webp",
  "/avatars/otter.webp",
  "/avatars/panda.webp",
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
