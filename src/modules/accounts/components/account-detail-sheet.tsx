"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Trash2 } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { useToastActionState } from "@/components/ui/toast";
import {
  fieldClass,
  fieldHintClass,
  fieldLabelClass,
} from "@/components/ui/styles";
import { cn } from "@/lib/utils";
import {
  deleteAccountAction,
  updateAccountFromSheetAction,
  type AccountActionState,
} from "../actions/account-actions";
import { accountTypeLabel, ACCOUNT_TYPES } from "../constants/account-types";
import type { AccountBalanceRow } from "../queries/accounts";

export function AccountDetailSheet({
  row,
  isHome,
  onClose,
}: {
  row: AccountBalanceRow | null;
  isHome: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [showOnHome, setShowOnHome] = useState(isHome);
  const [type, setType] = useState<string>(row?.type ?? "cash");
  const [typeSheetOpen, setTypeSheetOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const deleteFormRef = useRef<HTMLFormElement>(null);

  const [prevRowId, setPrevRowId] = useState(row?.id ?? null);
  if (prevRowId !== (row?.id ?? null)) {
    setPrevRowId(row?.id ?? null);
    setShowOnHome(isHome);
    setType(row?.type ?? "cash");
    setTypeSheetOpen(false);
    setConfirming(false);
  }

  const [, updateAction, updating] = useToastActionState<
    AccountActionState,
    FormData
  >(updateAccountFromSheetAction, {}, undefined, () => {
    onClose();
    router.refresh();
  });
  const [, deleteAction, deleting] = useToastActionState<
    AccountActionState,
    FormData
  >(deleteAccountAction, {}, undefined, () => {
    onClose();
    router.refresh();
  });

  function handleDeleteConfirm() {
    deleteFormRef.current?.requestSubmit();
  }

  return (
    <>
      <BottomSheet
        open={row !== null}
        onClose={onClose}
        title="Account Details"
        ariaLabel="Account details"
      >
        {row ? (
          <form action={updateAction} className="grid gap-[1.1rem]">
            <input type="hidden" name="id" value={row.id} />
            <input type="hidden" name="openingBalance" value={row.openingBalance} />
            <input type="hidden" name="showOnHome" value={showOnHome ? "true" : "false"} />
            <input type="hidden" name="type" value={type} />

            <div className={fieldClass}>
              <label htmlFor="detail-account-name" className={fieldLabelClass}>Account name</label>
              <Input
                id="detail-account-name"
                name="name"
                defaultValue={row.name}
                maxLength={80}
                required
              />
            </div>

            <button
              type="button"
              aria-pressed={showOnHome}
              aria-label={showOnHome ? "Home balance selected" : "Use for Home balance"}
              disabled={isHome}
              onClick={() => setShowOnHome((value) => !value)}
              className={cn(
                "flex min-h-12 w-full items-center justify-between rounded-[1.12rem] border px-4 text-left text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600",
                showOnHome ? "border-[#171717] bg-[#171717] text-white" : "border-border bg-surface-subtle text-foreground hover:border-[#171717]",
              )}
            >
              <span>Show balance on Home</span>
              <span className="text-xs">{showOnHome ? "Selected" : "Select"}</span>
            </button>

            <div className={fieldClass}>
              <label htmlFor="detail-account-type" className={fieldLabelClass}>
                Account type
              </label>
              <button
                type="button"
                id="detail-account-type"
                className="flex w-full min-h-[2.6rem] cursor-pointer items-center justify-between gap-[.5rem] rounded-[1.12rem] border border-border bg-surface-subtle px-[.8rem] py-[.6rem] text-left font-medium text-foreground transition-[border,box-shadow] duration-150 hover:border-primary-500 focus:border-primary-500 focus:shadow-[0_0_0_3px_rgb(23_23_23/12%)] focus:outline-none"
                onClick={() => setTypeSheetOpen(true)}
              >
                <span>{accountTypeLabel(type)}</span>
                <ChevronRight size={18} aria-hidden="true" className="shrink-0 text-muted" />
              </button>
              <small className={fieldHintClass}>The account type can be changed freely.</small>
            </div>

            <Button type="submit" disabled={updating}>
              {updating ? "Saving..." : "Save Edit"}
            </Button>

            <div className="border-t border-border" role="separator" />

            <Button
              type="button"
              variant="ghost"
              className="text-expense hover:bg-[color-mix(in_srgb,var(--expense)_8%,transparent)] hover:text-expense"
              onClick={() => setConfirming(true)}
            >
              <Trash2 size={17} aria-hidden="true" />
              Delete Account
            </Button>
          </form>
        ) : null}
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
                "flex min-h-[2.7rem] w-full cursor-pointer items-center gap-[.6rem] rounded-[1.12rem] border-0 px-[.75rem] py-[.55rem] text-left text-[.9rem] font-medium text-foreground transition-colors hover:bg-surface-subtle",
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

      <form ref={deleteFormRef} action={deleteAction} className="hidden">
        {row ? <input type="hidden" name="id" value={row.id} /> : null}
      </form>

      <ConfirmDialog
        open={confirming && row !== null}
        onClose={() => setConfirming(false)}
        title="Delete account?"
        message={`Are you sure you want to delete "${row?.name ?? "this account"}"? This action cannot be undone.`}
        pending={deleting}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
