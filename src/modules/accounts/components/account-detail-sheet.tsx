"use client";

import { useEffect, useRef, useState } from "react";
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
  fieldLabelRowClass,
} from "@/components/ui/styles";
import { cn } from "@/lib/utils";
import {
  deleteAccountAction,
  updateAccountFromSheetAction,
  type AccountActionState,
} from "../actions/account-actions";
import { accountTypeLabel, ACCOUNT_TYPES } from "../constants/account-types";
import type { AccountBalanceRow } from "../queries/accounts";

function StatusSwitch({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label="Active account"
      className={cn(
        "relative h-[1.55rem] w-[2.7rem] shrink-0 cursor-pointer rounded-full transition-colors duration-150",
        active ? "bg-primary-600" : "border border-border bg-surface-subtle",
      )}
      onClick={onToggle}
    >
      <span
        className={cn(
          "absolute top-1/2 size-[1.2rem] -translate-y-1/2 rounded-full bg-white shadow-[0_1px_4px_rgb(15_15_18/30%)] transition-[left] duration-150",
          active ? "left-[calc(100%-1.3rem)]" : "left-[.15rem]",
        )}
      />
    </button>
  );
}

export function AccountDetailSheet({
  row,
  onClose,
}: {
  row: AccountBalanceRow | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [active, setActive] = useState(row?.status === "active");
  const [type, setType] = useState<string>(row?.type ?? "cash");
  const [typeSheetOpen, setTypeSheetOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const deleteFormRef = useRef<HTMLFormElement>(null);

  const [prevRowId, setPrevRowId] = useState(row?.id ?? null);
  if (prevRowId !== (row?.id ?? null)) {
    setPrevRowId(row?.id ?? null);
    setActive(row?.status === "active");
    setType(row?.type ?? "cash");
    setTypeSheetOpen(false);
    setConfirming(false);
  }

  const [updateState, updateAction, updating] = useToastActionState<
    AccountActionState,
    FormData
  >(updateAccountFromSheetAction, {});
  const [deleteState, deleteAction, deleting] = useToastActionState<
    AccountActionState,
    FormData
  >(deleteAccountAction, {});

  function handleDeleteConfirm() {
    deleteFormRef.current?.requestSubmit();
  }

  useEffect(() => {
    if (updateState.success) {
      onClose();
      router.refresh();
    }
  }, [updateState.success, onClose, router]);

  useEffect(() => {
    if (deleteState.success) {
      onClose();
      router.refresh();
    }
  }, [deleteState.success, onClose, router]);

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
            <input type="hidden" name="status" value={active ? "active" : "archived"} />
            <input type="hidden" name="type" value={type} />

            <div className={fieldClass}>
              <div className={fieldLabelRowClass}>
                <label htmlFor="detail-account-name" className={fieldLabelClass}>
                  Account name
                </label>
                <StatusSwitch active={active} onToggle={() => setActive((value) => !value)} />
              </div>
              <Input
                id="detail-account-name"
                name="name"
                defaultValue={row.name}
                maxLength={80}
                required
              />
            </div>

            <div className={fieldClass}>
              <label htmlFor="detail-account-type" className={fieldLabelClass}>
                Account type
              </label>
              <button
                type="button"
                id="detail-account-type"
                className="flex w-full min-h-[2.6rem] cursor-pointer items-center justify-between gap-[.5rem] rounded-[.65rem] border border-border bg-surface-subtle px-[.8rem] py-[.6rem] text-left font-medium text-foreground transition-[border,box-shadow] duration-150 hover:border-primary-500 focus:border-primary-500 focus:shadow-[0_0_0_3px_rgb(79_70_229/12%)] focus:outline-none"
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