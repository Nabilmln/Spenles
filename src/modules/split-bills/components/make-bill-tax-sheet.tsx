"use client";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { fieldClass } from "@/components/ui/styles";
import type { SplitBillTaxMode } from "../types/split-bill";
import { RupiahInput } from "./money-input";

export function MakeBillTaxSheet({
  open,
  onClose,
  mode,
  onModeChange,
  percentValue,
  onPercentChange,
  fixedValue,
  onFixedChange,
}: {
  open: boolean;
  onClose: () => void;
  mode: SplitBillTaxMode;
  onModeChange: (mode: SplitBillTaxMode) => void;
  percentValue: string;
  onPercentChange: (value: string) => void;
  fixedValue: string;
  onFixedChange: (value: string) => void;
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Bill Tax" ariaLabel="Bill tax">
      <div className="grid gap-[1rem]">
        <div className={fieldClass}>
          <label className="text-[.86rem] font-medium" htmlFor="make-bill-tax-mode">
            Tax type
          </label>
          <Select
            id="make-bill-tax-mode"
            value={mode}
            onChange={(event) =>
              onModeChange(event.target.value as SplitBillTaxMode)
            }
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed amount</option>
          </Select>
        </div>

        {mode === "percentage" ? (
          <div className={fieldClass}>
            <label className="text-[.86rem] font-medium" htmlFor="make-bill-tax-percent">
              Tax (%)
            </label>
            <Input
              id="make-bill-tax-percent"
              type="number"
              min="0"
              max="100"
              step="any"
              inputMode="decimal"
              value={percentValue}
              onChange={(event) => onPercentChange(event.target.value)}
            />
          </div>
        ) : (
          <div className={fieldClass}>
            <label className="text-[.86rem] font-medium" htmlFor="make-bill-tax-fixed">
              Tax (Rp)
            </label>
            <RupiahInput
              id="make-bill-tax-fixed"
              value={fixedValue}
              onChange={onFixedChange}
            />
          </div>
        )}

        <Button type="button" className="mt-[.5rem] w-full" onClick={onClose}>
          Apply
        </Button>
      </div>
    </BottomSheet>
  );
}