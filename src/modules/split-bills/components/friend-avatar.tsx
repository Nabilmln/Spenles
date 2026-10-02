import Image from "next/image";
import { avatarIndexForId, avatarPath } from "@/lib/avatars";

export function FriendAvatar({
  name,
  friendId,
  avatarIndex,
  size = "md",
}: {
  name: string;
  friendId?: string;
  avatarIndex?: number | null;
  size?: "xs" | "sm" | "md";
}) {
  const initial = name.slice(0, 1).toUpperCase();
  const sizeClasses =
    size === "xs"
      ? "size-[1.5rem] text-[.55rem]"
      : size === "sm"
        ? "size-[2.6rem] text-[.8rem]"
        : "size-[3.2rem] text-[.9rem]";
  const imageIndex = avatarIndex ?? (friendId ? avatarIndexForId(friendId) : null);

  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-primary-600 font-medium text-white ${sizeClasses}`}
    >
      {imageIndex ? (
        <Image
          src={avatarPath(imageIndex)}
          alt=""
          width={52}
          height={52}
          className="size-full object-cover"
        />
      ) : initial}
    </span>
  );
}
