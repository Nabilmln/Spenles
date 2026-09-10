"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToastActionState } from "@/components/ui/toast";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { buttonClass, fieldClass, inputClass } from "@/components/ui/styles";
import { createFriendAction } from "../../friends/actions/friend-actions";
import type { FriendActionState } from "../../friends/actions/friend-actions";

const initialState: FriendActionState = {};

export function SplitBillFriendAddSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [state, action, pending] = useToastActionState(
    createFriendAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.success) router.refresh();
  }, [state.success, router]);

  return (
    <BottomSheet
      open={open}
      onClose={() => {
        formRef.current?.reset();
        onClose();
      }}
      title="Add Friend"
      ariaLabel="Add friend"
    >
      <form ref={formRef} action={action} className="grid gap-[1rem]">
        <div className={fieldClass}>
          <label className="text-[.86rem] font-medium" htmlFor="friend-name">
            Friend name
          </label>
          <input
            className={inputClass}
            id="friend-name"
            name="name"
            placeholder="e.g. Alice"
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
          {pending ? "Adding..." : "Add Friend"}
        </button>
      </form>
    </BottomSheet>
  );
}