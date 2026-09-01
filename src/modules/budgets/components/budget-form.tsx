"use client";

import { useToastActionState } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { fieldClass, fieldLabelClass } from "@/components/ui/styles";
import type { BudgetActionState } from "../actions/budget-actions";

export function BudgetForm({
  action,
  categories,
  initial,
}: {
  action: (
    state: BudgetActionState,
    data: FormData,
  ) => Promise<BudgetActionState>;
  categories: Array<{ id: string; name: string }>;
  initial?: {
    id: string;
    categoryId: string;
    month: string;
    amount: string;
    warningThresholdBps: number;
  };
}) {
  const [, formAction, pending] = useToastActionState(action, {});
  return (
    <form action={formAction} className="grid gap-4">
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
      <div className={fieldClass}>
        <label htmlFor="budget-category" className={fieldLabelClass}>Expense category</label>
        <Select
          id="budget-category"
          name="categoryId"
          defaultValue={initial?.categoryId}
          disabled={Boolean(initial)}
          required
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </Select>
        {initial ? <input type="hidden" name="categoryId" value={initial.categoryId} /> : null}
      </div>
      <div className={fieldClass}>
        <label htmlFor="budget-month" className={fieldLabelClass}>Month</label>
        <Input
          id="budget-month"
          name="month"
          type="month"
          defaultValue={initial?.month}
          disabled={Boolean(initial)}
          required
        />
        {initial ? <input type="hidden" name="month" value={initial.month} /> : null}
      </div>
      <div className={fieldClass}>
        <label htmlFor="budget-amount" className={fieldLabelClass}>Budget amount (IDR)</label>
        <Input
          id="budget-amount"
          name="amount"
          type="number"
          min="1"
          step="1"
          defaultValue={initial?.amount}
          required
        />
      </div>
      <div className={fieldClass}>
        <label htmlFor="budget-threshold" className={fieldLabelClass}>Warning threshold</label>
        <Select
          id="budget-threshold"
          name="warningThresholdBps"
          defaultValue={String(initial?.warningThresholdBps ?? 8000)}
        >
          <option value="5000">50%</option>
          <option value="7500">75%</option>
          <option value="8000">80%</option>
          <option value="9000">90%</option>
          <option value="10000">100%</option>
        </Select>
      </div>
      <Button type="submit" disabled={pending || categories.length === 0}>
        {pending ? "Saving..." : initial ? "Save changes" : "Create budget"}
      </Button>
    </form>
  );
}
