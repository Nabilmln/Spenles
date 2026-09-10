export function FriendAvatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md";
}) {
  const initial = name.slice(0, 1).toUpperCase();
  const sizeClasses =
    size === "sm"
      ? "size-[2.6rem] text-[.8rem]"
      : "size-[3.2rem] text-[.9rem]";

  return (
    <span
      aria-hidden="true"
      className={`grid place-items-center rounded-full bg-primary-600 font-medium text-white shadow-[0_2px_8px_rgb(79_70_229/25%)] ${sizeClasses}`}
    >
      {initial}
    </span>
  );
}
