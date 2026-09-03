"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { AmountInput } from "@/components/ui/amount-input";
import { Input } from "@/components/ui/input";
import { useToastActionState } from "@/components/ui/toast";
import {
  fieldClass,
  fieldHintClass,
  fieldLabelClass,
} from "@/components/ui/styles";
import { cn } from "@/lib/utils";
import {
  createAccountFromSheetAction,
  type AccountActionState,
} from "../actions/account-actions";
import { accountTypeLabel, ACCOUNT_TYPES } from "../constants/account-types";

export function AccountCreateSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [type, setType] = useState<string>("cash");
  const [typeSheetOpen, setTypeSheetOpen] = useState(false);

  const [state, formAction, pending] = useToastActionState<
    AccountActionState,
    FormData
  >(createAccountFromSheetAction, {});

  useEffect(() => {
    if (state.success) {
      onClose();
      router.refresh();
    }
  }, [state.success, onClose, router]);

  return (
    <>
      <BottomSheet
        open={open}
        onClose={onClose}
        title="Add Account"
        ariaLabel="Add account"
      >
        <form action={formAction} className="grid gap-[1.1rem]">
          <input type="hidden" name="type" value={type} />

          <div className={fieldClass}>
            <label htmlFor="create-account-name" className={fieldLabelClass}>
              Account name
            </label>
            <Input
              id="create-account-name"
              name="name"
              placeholder="e.g. BCA Savings"
              maxLength={80}
              required
            />
          </div>

          <div className={fieldClass}>
            <label htmlFor="create-account-type" className={fieldLabelClass}>
              Account type
            </label>
            <button
              type="button"
              id="create-account-type"
              className="flex w-full min-h-[2.6rem] cursor-pointer items-center justify-between gap-[.5rem] rounded-[.65rem] border border-border bg-surface-subtle px-[.8rem] py-[.6rem] text-left font-medium text-foreground transition-[border,box-shadow] duration-150 hover:border-primary-500 focus:border-primary-500 focus:shadow-[0_0_0_3px_rgb(79_70_229/12%)] focus:outline-none"
              onClick={() => setTypeSheetOpen(true)}
            >
              <span>{accountTypeLabel(type)}</span>
              <ChevronRight size={18} aria-hidden="true" className="shrink-0 text-muted" />
            </button>
          </div>

          <div className={fieldClass}>
            <label htmlFor="create-account-opening-balance" className={fieldLabelClass}>
              Opening balance (IDR)
            </label>
            <AmountInput
              id="create-account-opening-balance"
              name="openingBalance"
              defaultValue="0"
              required
            />
            <small className={fieldHintClass}>
              The amount this account starts with.
            </small>
          </div>

          <Button type="submit" disabled={pending} className="mb-4">
            {pending ? "Creating..." : "Create Account"}
          </Button>
        </form>
      </BottomSheet>

      <BottomSheet
        open={typeSheetOpen}
        onClose={() => setTypeSheetOpen(false)}
        title="Account Type"
        ariaLabel="Choose account type"
        zIndex="z-[85]"
      >
        <div className="grid gap-[.4rem]">
          {ACCOUNT_TYPES.map((option) => (
            <button
              type="button"
              key={option.value}
              className={cn(
                "flex min-h-[2.7rem] w-full cursor-pointer items-center gap-[.6rem] rounded-[.7rem] border-0 px-[.75rem] py-[.55rem] text-left text-[.9rem] font-medium text-foreground transition-colors hover:bg-surface-subtle",
                type === option.value && "bg-primary-50 text-primary-700",
              )}
              onClick={() => {
                setType(option.value);
                setTypeSheetOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </BottomSheet>
    </>
  );
}