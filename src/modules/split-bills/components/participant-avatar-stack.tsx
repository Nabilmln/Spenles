import { FriendAvatar } from "./friend-avatar";

const DEFAULT_MAX_VISIBLE = 3;

export function ParticipantAvatarStack({
  names,
  count,
  maxVisible = DEFAULT_MAX_VISIBLE,
}: {
  names: string[];
  count: number;
  maxVisible?: number;
}) {
  if (count <= 0) return null;

  const visible = names.slice(0, maxVisible);
  const paddingCount = Math.max(0, Math.min(count, maxVisible) - visible.length);
  const displayNames = [
    ...visible,
    ...Array.from({ length: paddingCount }, () => ""),
  ];
  const extra = Math.max(0, count - maxVisible);

  return (
    <div
      aria-label={`${count} participants`}
      className="flex items-center"
      role="img"
      title={`${count} participants`}
    >
      <div className="flex items-center">
        {displayNames.map((name, index) => (
          <span
            className={`flex shrink-0 overflow-hidden rounded-full ring-2 ring-surface ${
              index > 0 ? "-ml-[1.3rem]" : ""
            }`}
            key={`${name || "p"}-${index}`}
          >
            <FriendAvatar name={name} size="sm" />
          </span>
        ))}
      </div>
      {extra > 0 ? (
        <span className="ml-[.4rem] shrink-0 text-[.72rem] font-semibold text-muted">
          +{extra}
        </span>
      ) : null}
    </div>
  );
}