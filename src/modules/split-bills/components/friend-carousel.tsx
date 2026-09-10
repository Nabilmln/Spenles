"use client";

import { UserPlus } from "lucide-react";
import { FriendAvatar } from "./friend-avatar";
import type { FriendRow } from "@/modules/friends";

export function FriendCarousel({
  friends,
  onAddFriend,
}: {
  friends: FriendRow[];
  onAddFriend: () => void;
}) {
  if (friends.length === 0) {
    return (
      <button
        type="button"
        onClick={onAddFriend}
        className="flex min-h-[5.5rem] w-full items-center justify-center rounded-[1rem] border-2 border-dashed border-border bg-surface-subtle text-[.82rem] font-medium text-muted transition-colors hover:border-primary-300 hover:text-primary-600"
      >
        <UserPlus size={18} aria-hidden="true" className="mr-[.4rem]" />
        Add Friend
      </button>
    );
  }

  return (
    <div className="min-w-0">
      <div className="flex min-w-0 gap-[.9rem] overflow-x-auto pb-1 scrollbar-none">
        {friends.map((friend) => (
          <button
            key={friend.id}
            type="button"
            className="flex shrink-0 flex-col items-center gap-[.3rem]"
          >
            <FriendAvatar name={friend.name} />
            <span className="max-w-[4rem] truncate text-[.7rem] text-muted">
              {friend.name}
            </span>
          </button>
        ))}
        <button
          type="button"
          onClick={onAddFriend}
          className="flex shrink-0 flex-col items-center gap-[.3rem]"
        >
          <span className="grid size-[3.2rem] place-items-center rounded-full border-2 border-dashed border-border bg-surface-subtle text-primary-600">
            <UserPlus size={16} aria-hidden="true" />
          </span>
          <span className="max-w-[4rem] truncate text-[.7rem] text-muted">
            Add
          </span>
        </button>
      </div>
    </div>
  );
}
