"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast, useToastActionState } from "@/components/ui/toast";
import { buttonClass, fieldClass, inputClass } from "@/components/ui/styles";
import {
  deleteFriendAction,
  updateFriendAction,
  type FriendActionState,
} from "../../friends/actions/friend-actions";
import type { FriendRow } from "../../friends/queries/friends";

const initialState: FriendActionState = {};

function FriendEditForm({
  friend,
  onSaved,
  onClose,
}: {
  friend: FriendRow;
  onSaved: (friend: FriendRow) => void;
  onClose: () => void;
}) {
  const [state, action, pending] = useToastActionState(
    updateFriendAction,
    initialState,
  );
  const [name, setName] = useState(friend.name);
  const router = useRouter();

  useEffect(() => {
    if (!state.success) return;
    onSaved({ ...friend, name: name.trim() });
    router.refresh();
    onClose();
  }, [state.success, friend, name, onSaved, onClose, router]);

  return (
    <form action={action} className="grid gap-[1rem]">
      <input type="hidden" name="id" value={friend.id} />
      <div className={fieldClass}>
        <label className="text-[.86rem] font-medium" htmlFor="friend-edit-name">
          Friend name
        </label>
        <input
          className={inputClass}
          id="friend-edit-name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          type="text"
          aria-invalid={Boolean(state.error)}
        />
      </div>
      <button
        className={buttonClass("primary", "w-full justify-center")}
        disabled={pending}
        type="submit"
      >
        {pending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}

export function SplitBillFriendEditSheet({
  open,
  onClose,
  friend,
  onSaved,
  onDeleted,
}: {
  open: boolean;
  onClose: () => void;
  friend: FriendRow | null;
  onSaved?: (friend: FriendRow) => void;
  onDeleted?: (id: string) => void;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, startDelete] = useTransition();
  const router = useRouter();
  const toast = useToast();

  function handleClose() {
    setDeleteOpen(false);
    onClose();
  }

  function confirmDelete() {
    if (!friend) return;
    startDelete(async () => {
      const result = await deleteFriendAction(friend.id);
      if (result.ok) {
        toast.success("Friend deleted.");
        onDeleted?.(friend.id);
        router.refresh();
        setDeleteOpen(false);
        onClose();
      } else {
        toast.error("Friend could not be deleted.");
      }
    });
  }

  return (
    <>
      <BottomSheet
        open={open}
        onClose={handleClose}
        title="Edit Friend"
        ariaLabel="Edit friend"
      >
        {friend ? (
          <FriendEditForm
            key={friend.id}
            friend={friend}
            onSaved={onSaved ?? (() => {})}
            onClose={handleClose}
          />
        ) : null}

        <div className="mt-[1.6rem] border-t border-border pt-[1.1rem]">
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="flex w-full items-center justify-center gap-[.5rem] rounded-[.8rem] bg-surface-subtle px-[.9rem] py-[.85rem] text-[.88rem] font-medium text-expense transition-colors hover:bg-[color-mix(in_srgb,var(--expense)_8%,transparent)]"
          >
            <Trash2 size={17} aria-hidden="true" />
            Delete Friend
          </button>
        </div>
      </BottomSheet>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Friend?"
        message="This friend will be removed from your friends list. Existing split bills are not affected."
        confirmLabel="Delete Friend"
        pending={deleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}