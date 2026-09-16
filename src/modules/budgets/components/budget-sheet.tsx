"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { AmountInput } from "@/components/ui/amount-input";
import { CalendarRangeSelector } from "@/components/ui/calendar-range-selector";
import { useToastActionState } from "@/components/ui/toast";
import {
  fieldClass,
  fieldHintClass,
  fieldLabelClass,
  inputClass,
} from "@/components/ui/styles";
import { cn } from "@/lib/utils";
import {
  createBudgetAction,
  updateBudgetAction,
  type BudgetActionState,
} from "../actions/budget-actions";
import {
  BudgetCategorySheet,
  BudgetOptionSheet,
  type BudgetCategoryOption,
} from "./budget-picker-sheets";
import type { BudgetListRow, BudgetPeriodType } from "../queries/budgets";

const PERIOD_OPTIONS: Array<{ value: BudgetPeriodType; label: string }> = [
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
  { value: "custom", label: "Custom" },
];

const WARNING_MODE_OPTIONS = [
  { value: "threshold", label: "Percentage" },
  { value: "days", label: "Days left" },
] as const;

const THRESHOLD_OPTIONS = [
  { value: "5000", label: "50%" },
  { value: "7500", label: "75%" },
  { value: "8000", label: "80%" },
  { value: "9000", label: "90%" },
  { value: "10000", label: "100%" },
];

const DAYS_OPTIONS = [
  { value: "1", label: "Last 1 day" },
  { value: "3", label: "Last 3 days" },
  { value: "5", label: "Last 5 days" },
];

function segmentedClass(active: boolean) {
  return cn(
    "flex-1 min-h-[2.6rem] cursor-pointer items-center justify-center rounded-[.7rem] border border-transparent px-[.5rem] py-[.55rem] text-[.82rem] font-medium text-muted transition-[background,color] duration-150",
    active
      ? "bg-primary-600 text-white shadow-[0_2px_10px_rgb(79_70_229/25%)]"
      : "bg-surface-subtle hover:bg-surface-subtle hover:text-foreground",
  );
}

function sheetFieldClass() {
  return cn(
    inputClass,
    "flex min-h-[2.9rem] cursor-pointer items-center justify-between gap-[.5rem] rounded-[.72rem] bg-white! p-[.72rem_.85rem] text-left dark:bg-surface!",
  );
}

function BudgetSheetForm({
  initial,
  categories,
  onClose,
}: {
  initial: BudgetListRow | null;
  categories: BudgetCategoryOption[];
  onClose: () => void;
}) {
  const action = initial ? updateBudgetAction : createBudgetAction;
  const [state, formAction, pending] = useToastActionState<
    BudgetActionState,
    FormData
  >(action, {});
  const router = useRouter();
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const [periodType, setPeriodType] = useState<BudgetPeriodType>(
    initial?.periodType ?? "monthly",
  );
  const [periodStart, setPeriodStart] = useState(initial?.periodStart ?? "");
  const [periodEnd, setPeriodEnd] = useState(initial?.periodEnd ?? "");
  const [warningMode, setWarningMode] = useState<"threshold" | "days">(
    initial
      ? initial.warningThresholdBps !== null
        ? "threshold"
        : "days"
      : "threshold",
  );
  const [threshold, setThreshold] = useState(
    String(initial?.warningThresholdBps ?? 8000),
  );
  const [thresholdSheetOpen, setThresholdSheetOpen] = useState(false);
  const [days, setDays] = useState(String(initial?.warningDaysRemaining ?? 3));
  const [daysSheetOpen, setDaysSheetOpen] = useState(false);

  useEffect(() => {
    if (!state.success) return;
    router.refresh();
    onClose();
  }, [state.success, router, onClose]);

  const anyCategory = categories.length > 0;
  const selectedCategory = categories.find((item) => item.id === categoryId);

  return (
    <>
      <form id="budget-sheet-form" action={formAction} className="grid gap-[1.1rem]">
        {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
        <div className={fieldClass}>
          <span className={fieldLabelClass}>Expense category</span>
          <button
            type="button"
            className={sheetFieldClass()}
            onClick={() => setCategorySheetOpen(true)}
            aria-haspopup="dialog"
          >
            <span className="min-w-0 truncate">
              {selectedCategory?.name ?? "Choose Category"}
            </span>
            <ChevronRight aria-hidden="true" className="shrink-0 text-muted" size={18} />
          </button>
          <input type="hidden" name="categoryId" value={categoryId} />
        </div>

        <div className={fieldClass}>
          <span className="text-[.86rem] font-medium">Period</span>
          <div className="flex gap-[.4rem]" role="group" aria-label="Budget period">
            {PERIOD_OPTIONS.map((option) => (
              <button
                aria-pressed={periodType === option.value}
                className={segmentedClass(periodType === option.value)}
                key={option.value}
                onClick={() => setPeriodType(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
          <input type="hidden" name="periodType" value={periodType} />
          {periodType === "custom" ? (
            <p className={fieldHintClass}>
              Usage counts expenses between the chosen start and end dates.
            </p>
          ) : (
            <p className={fieldHintClass}>
              {periodType === "monthly"
                ? "Recurs against the current Jakarta calendar month."
                : "Recurs against the current Jakarta week (Monday to Sunday)."}
            </p>
          )}
        </div>

        {periodType === "custom" ? (
          <div className={fieldClass}>
            <span className="text-[.86rem] font-medium">Date range</span>
            <CalendarRangeSelector
              from={periodStart}
              to={periodEnd}
              onChange={(from, to) => {
                setPeriodStart(from);
                setPeriodEnd(to);
              }}
              maxDays={366}
              allowFuture
            />
            <input type="hidden" name="periodStart" value={periodStart} />
            <input type="hidden" name="periodEnd" value={periodEnd} />
          </div>
        ) : (
          <>
            <input type="hidden" name="periodStart" value="" />
            <input type="hidden" name="periodEnd" value="" />
          </>
        )}

        <div className={fieldClass}>
          <label htmlFor="budget-amount" className={fieldLabelClass}>
            Budget amount (IDR)
          </label>
          <AmountInput
            id="budget-amount"
            name="amount"
            defaultValue={initial?.amount}
            required
          />
        </div>

        <div className={fieldClass}>
          <span className="text-[.86rem] font-medium">Warning</span>
          <div className="flex gap-[.4rem]" role="group" aria-label="Warning rule">
            {WARNING_MODE_OPTIONS.map((option) => (
              <button
                aria-pressed={warningMode === option.value}
                className={segmentedClass(warningMode === option.value)}
                key={option.value}
                onClick={() => setWarningMode(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
          <input type="hidden" name="warningMode" value={warningMode} />
        </div>

        {warningMode === "threshold" ? (
          <div className={fieldClass}>
            <span className={fieldLabelClass}>Warning at percentage used</span>
            <button
              type="button"
              className={sheetFieldClass()}
              onClick={() => setThresholdSheetOpen(true)}
              aria-haspopup="dialog"
            >
              <span className="min-w-0 truncate">
                {THRESHOLD_OPTIONS.find((item) => item.value === threshold)?.label ??
                  "Choose percentage"}
              </span>
              <ChevronRight aria-hidden="true" className="shrink-0 text-muted" size={18} />
            </button>
            <input type="hidden" name="warningThresholdBps" value={threshold} />
            <input type="hidden" name="warningDaysRemaining" value="" />
          </div>
        ) : (
          <div className={fieldClass}>
            <span className={fieldLabelClass}>Warn during last days of the period</span>
            <button
              type="button"
              className={sheetFieldClass()}
              onClick={() => setDaysSheetOpen(true)}
              aria-haspopup="dialog"
            >
              <span className="min-w-0 truncate">
                {DAYS_OPTIONS.find((item) => item.value === days)?.label ??
                  "Choose days"}
              </span>
              <ChevronRight aria-hidden="true" className="shrink-0 text-muted" size={18} />
            </button>
            <input type="hidden" name="warningDaysRemaining" value={days} />
            <input type="hidden" name="warningThresholdBps" value="" />
          </div>
        )}
      </form>

      <Button
        form="budget-sheet-form"
        className="mt-[1.6rem] w-full justify-center"
        disabled={pending || !anyCategory}
        type="submit"
      >
        {pending ? "Saving..." : initial ? "Save changes" : "Create budget"}
      </Button>

      <BudgetCategorySheet
        open={categorySheetOpen}
        onClose={() => setCategorySheetOpen(false)}
        categories={categories}
        selectedId={categoryId}
        onSelect={setCategoryId}
      />
      <BudgetOptionSheet
        open={thresholdSheetOpen}
        onClose={() => setThresholdSheetOpen(false)}
        title="Warning percentage"
        ariaLabel="Select warning percentage"
        options={THRESHOLD_OPTIONS}
        selectedValue={threshold}
        onSelect={setThreshold}
      />
      <BudgetOptionSheet
        open={daysSheetOpen}
        onClose={() => setDaysSheetOpen(false)}
        title="Days remaining warning"
        ariaLabel="Select days remaining warning"
        options={DAYS_OPTIONS}
        selectedValue={days}
        onSelect={setDays}
      />
    </>
  );
}

export function BudgetSheet({
  open,
  onClose,
  categories,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  categories: BudgetCategoryOption[];
  initial: BudgetListRow | null;
}) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={initial ? "Edit budget" : "Create budget"}
      ariaLabel={initial ? "Edit budget" : "Create budget"}
    >
      {categories.length === 0 && !initial ? (
        <p className="m-0 text-muted">
          No active expense categories. Add an expense category before creating a
          budget.
        </p>
      ) : null}
      {categories.length > 0 || initial ? (
        <BudgetSheetForm
          key={initial?.id ?? "new"}
          initial={initial}
          categories={categories}
          onClose={onClose}
        />
      ) : null}
    </BottomSheet>
  );
}