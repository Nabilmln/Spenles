"use client";

import { useMemo, useState } from "react";
import { Delete, Divide, Minus, Plus, X, type LucideIcon } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { cn } from "@/lib/utils";
import { formatIdr } from "@/lib/money/format-idr";
import { calculateExpression } from "../services/calculator";

function KeypadButton({
  label,
  aria,
  onClick,
  icon: Icon,
  operator = false,
}: {
  label: string;
  aria: string;
  onClick: () => void;
  icon?: LucideIcon;
  operator?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "grid min-h-[2.85rem] place-items-center rounded-full text-foreground transition-[background,transform] active:scale-[.98] focus-visible:outline-2 focus-visible:outline-primary-600 focus-visible:outline-offset-2",
        operator
          ? "bg-transparent text-[1rem] hover:bg-surface-subtle"
          : "bg-surface text-[1.05rem] font-semibold shadow-[0_1px_3px_rgb(15_15_18/5%)] hover:bg-[#fafafa]",
      )}
      aria-label={aria}
      onClick={onClick}
    >
      {Icon ? <Icon aria-hidden="true" size={21} strokeWidth={2.2} /> : label}
    </button>
  );
}

export function AmountCalculatorSheet({
  open,
  onClose,
  onCommit,
}: {
  open: boolean;
  onClose: () => void;
  onCommit: (amount: string) => void;
}) {
  const [expression, setExpression] = useState("");
  const [calculatorError, setCalculatorError] = useState("");
  const [prevOpen, setPrevOpen] = useState(open);

  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) {
      setExpression("");
      setCalculatorError("");
    }
  }

  const result = useMemo(() => {
    if (!expression.trim()) return null;
    try {
      return calculateExpression(expression);
    } catch {
      return null;
    }
  }, [expression]);
  const displayExpression = expression.replaceAll("*", "\u00d7").replaceAll("/", "\u00f7");

  function append(char: string) {
    setExpression((current) => current + char);
    setCalculatorError("");
  }

  function backspace() {
    setExpression((current) => current.replace(/\s+$/u, "").slice(0, -1));
  }

  function clear() {
    setExpression("");
    setCalculatorError("");
  }

  function commit() {
    if (!result) {
      setCalculatorError("Enter the amount using the number buttons so it can be calculated.");
      return;
    }
    onCommit(result);
    onClose();
    setExpression("");
    setCalculatorError("");
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Amount"
      ariaLabel="Amount calculator"
      zIndex="z-[85]"
      footer={
        <Button
          type="button"
          variant="primary"
          className="min-h-[3rem] w-full rounded-full text-[.88rem]"
          disabled={!result}
          onClick={commit}
        >
          Use Amount
        </Button>
      }
    >
      <div className="flex min-h-[8.5rem] flex-col items-center justify-center gap-[.45rem] px-1 text-center">
        <p className="m-0 max-w-full text-[clamp(2.15rem,10vw,3.25rem)] font-semibold leading-tight tracking-[-.035em] text-foreground tabular-nums [overflow-wrap:anywhere]" aria-live="polite">
          {result ? formatIdr(result) : expression ? "\u2014" : formatIdr("0")}
        </p>
        <output className="min-h-[1.25rem] w-full truncate text-[.75rem] text-muted" aria-label="Calculator expression">
          {displayExpression || "Tap the keys to enter an amount"}
        </output>
      </div>
      <FormMessage>{calculatorError}</FormMessage>
      <div className="mb-[.5rem] flex items-center justify-between gap-3 px-2">
        <span className="text-[.7rem] font-medium text-muted">Whole rupiah</span>
        <button type="button" className="min-h-9 px-2 text-[.72rem] font-semibold text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-primary-600" onClick={clear} aria-label="Clear">
          Clear
        </button>
      </div>
      <div className="mb-[.5rem] grid grid-cols-4 gap-[.45rem]">
        <KeypadButton label="+" aria="Add" icon={Plus} operator onClick={() => append("+")} />
        <KeypadButton label="-" aria="Subtract" icon={Minus} operator onClick={() => append("-")} />
        <KeypadButton label="*" aria="Multiply" icon={X} operator onClick={() => append("*")} />
        <KeypadButton label="/" aria="Divide" icon={Divide} operator onClick={() => append("/")} />
      </div>
      <div className="grid grid-cols-3 gap-[.45rem] rounded-[1.45rem] bg-surface-subtle p-[.45rem]">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((key) => (
          <KeypadButton key={key} label={key} aria={key} onClick={() => append(key)} />
        ))}
        <KeypadButton label="000" aria="Insert three zeros" onClick={() => append("000")} />
        <KeypadButton label="0" aria="Zero" onClick={() => append("0")} />
        <KeypadButton label="Delete" aria="Delete last character" icon={Delete} onClick={backspace} />
      </div>
      <p className="m-0 mt-3 text-center text-[.68rem] text-muted">
        Calculations round to the nearest rupiah.
      </p>
    </BottomSheet>
  );
}
