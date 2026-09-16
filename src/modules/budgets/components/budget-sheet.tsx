"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { AmountInput } from "@/components/ui/amount-input";
import { CalendarRangeSelector } from "@/components/ui/calendar-range-selector";
import { Select } from "@/components/ui/select";
import { useToastActionState } from "@/components/ui/toast";
import { fieldClass, fieldHintClass, fieldLabelClass } from "@/components/ui/styles";
import { cn } from "@/lib/utils";
import {
  createBudgetAction,
  updateBudgetAction,
  type BudgetActionState,
} from "../actions/budget-actions";
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

function segmentedClass(active: boolean) {
  return cn(
    "flex-1 min-h-[2.6rem] cursor-pointer items-center justify-center rounded-[.7rem] border border-transparent px-[.5rem] py-[.55rem] text-[.82rem] font-medium text-muted transition-[background,color] duration-150",
    active
      ? "bg-primary-600 text-white shadow-[0_2px_10px_rgb(79_70_229/25%)]"
      : "bg-surface-subtle hover:bg-surface-subtle hover:text-foreground",
  );
}

function BudgetSheetForm({
  initial,
  categories,
  onClose,
}: {
  initial: BudgetListRow | null;
  categories: Array<{ id: string; name: string }>;
  onClose: () => void;
}) {
  const action = initial ? updateBudgetAction : createBudgetAction;
  const [state, formAction, pending] = useToastActionState<
    BudgetActionState,
    FormData
  >(action, {});
  const router = useRouter();
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [periodType, setPeriodType] = useState<BudgetPeriodType>(
    initial?.periodType ?? "monthly",
  );
  const [periodStart, setPeriodStart] = useState(initial?.periodStart ?? "");
  const [periodEnd, setPeriodEnd] = useState(initial?.periodEnd ?? "");
  const [warningMode, setWarningMode] = useState<"threshold" | "days">(
    initial ? (initial.warningThresholdBps !== null ? "threshold" : "days") : "threshold",
  );
  const [threshold, setThreshold] = useState(
    String(initial?.warningThresholdBps ?? 8000),
  );
  const [days, setDays] = useState(String(initial?.warningDaysRemaining ?? 3));

  useEffect(() => {
    if (!state.success) return;
    router.refresh();
    onClose();
  }, [state.success, router, onClose]);

  const anyCategory = categories.length > 0;

  return (
    <>
      <form id="budget-sheet-form" action={formAction} className="grid gap-[1.1rem]">
        {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
        <div className={fieldClass}>
          <label htmlFor="budget-category" className={fieldLabelClass}>
            Expense category
          </label>
          <Select
            id="budget-category"
            name="categoryId"
            aria-label="Expense category"
            value={categoryId}
            onChange={(event) => setCategoryId(event.currentTarget.value)}
            placeholder={anyCategory ? "Pick a category" : undefined}
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
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
            <label htmlFor="budget-threshold" className={fieldLabelClass}>
              Warning at percentage used
            </label>
            <Select
              id="budget-threshold"
              aria-label="Warning percentage"
              value={threshold}
              onChange={(event) => setThreshold(event.currentTarget.value)}
              required
            >
              <option value="5000">50%</option>
              <option value="7500">75%</option>
              <option value="8000">80%</option>
              <option value="9000">90%</option>
              <option value="10000">100%</option>
            </Select>
            <input type="hidden" name="warningThresholdBps" value={threshold} />
            <input type="hidden" name="warningDaysRemaining" value="" />
          </div>
        ) : (
          <div className={fieldClass}>
            <label htmlFor="budget-days" className={fieldLabelClass}>
              Warn during last days of the period
            </label>
            <Select
              id="budget-days"
              aria-label="Days remaining warning"
              value={days}
              onChange={(event) => setDays(event.currentTarget.value)}
              required
            >
              <option value="1">Last 1 day</option>
              <option value="3">Last 3 days</option>
              <option value="5">Last 5 days</option>
            </Select>
            <input type="hidden" name="warningDaysRemaining" value={days} />
            <input type="hidden" name="warningThresholdBps" value="" />
          </div>
        )}
      </form>

      <Button
        form="budget-sheet-form"
        className="w-full justify-center"
        disabled={pending || !anyCategory}
        type="submit"
      >
        {pending ? "Saving..." : initial ? "Save changes" : "Create budget"}
      </Button>
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
  categories: Array<{ id: string; name: string }>;
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