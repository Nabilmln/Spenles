"use client";

import { useState } from "react";
import { Check, Search, X } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Input } from "@/components/ui/input";
import { buttonClass, iconButtonClass } from "@/components/ui/styles";
import type { FriendRow } from "@/modules/friends";
import { FriendAvatar } from "./friend-avatar";

export function MakeBillFriendPickerSheet({
  open,
  onClose,
  friends,
  selectedIds,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  friends: FriendRow[];
  selectedIds: string[];
  onConfirm: (ids: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [tempIds, setTempIds] = useState<string[]>(() => [...selectedIds]);
  const [prevOpen, setPrevOpen] = useState(open);

  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) {
      setQuery("");
      setTempIds([...selectedIds]);
    }
  }

  const candidates = friends.filter(
    (friend) => !tempIds.includes(friend.id),
  );
  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? candidates.filter((friend) =>
        friend.name.toLowerCase().includes(normalized),
      )
    : candidates;

  const newlyAdded = friends.filter(
    (friend) => tempIds.includes(friend.id) && !selectedIds.includes(friend.id),
  );

  function toggle(friendId: string) {
    setTempIds((current) =>
      current.includes(friendId)
        ? current.filter((id) => id !== friendId)
        : [...current, friendId],
    );
  }

  function remove(friendId: string) {
    setTempIds((current) => current.filter((id) => id !== friendId));
  }

  function confirm() {
    onConfirm(tempIds);
    onClose();
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Add Friends" ariaLabel="Add friends">
      <div className="grid gap-[1rem]">
        <label className="relative block">
          <span className="sr-only">Search friends</span>
          <Search
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-[.8rem] -translate-y-1/2 text-muted"
          />
          <Input
            className="pl-[2.2rem]"
            placeholder="Search friends"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        {newlyAdded.length > 0 ? (
          <div className="flex flex-wrap gap-[.5rem]">
            {newlyAdded.map((friend) => (
              <span
                key={friend.id}
                className="inline-flex items-center gap-[.35rem] rounded-full border border-border bg-surface-subtle py-[.3rem] pr-[.3rem] pl-[.4rem]"
              >
                <FriendAvatar name={friend.name} size="xs" />
                <span className="text-[.82rem] font-medium">{friend.name}</span>
                <button
                  type="button"
                  className={iconButtonClass + " size-[1.6rem] rounded-full"}
                  aria-label={`Remove ${friend.name}`}
                  onClick={() => remove(friend.id)}
                >
                  <X size={13} aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        ) : null}

        {filtered.length === 0 ? (
          <p className="m-0 rounded-[.7rem] bg-surface-subtle p-[.75rem] text-[.82rem] text-muted">
            {friends.length === 0
              ? "You have no friends to split with yet."
              : "No friends match your search."}
          </p>
        ) : (
          <ul className="m-0 grid gap-[.4rem] p-0" role="list">
            {filtered.map((friend) => (
              <li key={friend.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-[.7rem] rounded-[.7rem] px-[.4rem] py-[.5rem] text-left transition-colors hover:bg-surface-subtle"
                  onClick={() => toggle(friend.id)}
                >
                  <FriendAvatar name={friend.name} size="sm" />
                  <span className="min-w-0 flex-1 truncate text-[.9rem] font-medium">
                    {friend.name}
                  </span>
                  <span
                    className="grid size-[1.5rem] place-items-center rounded-full border border-border text-muted"
                    aria-hidden="true"
                  >
                    <Check size={13} className="opacity-0" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          className={buttonClass("primary", "mt-[.5rem] w-full justify-center")}
          disabled={newlyAdded.length === 0}
          onClick={confirm}
        >
          {newlyAdded.length === 0
            ? "Add Friends"
            : `Add ${newlyAdded.length} ${newlyAdded.length === 1 ? "Friend" : "Friends"}`}
        </button>
      </div>
    </BottomSheet>
  );
}