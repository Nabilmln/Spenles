"use client";

import { useMemo, useState } from "react";
import {
  Delete,
  Divide,
  Equal,
  Minus,
  Plus,
  X,
  type LucideIcon,
} from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { fieldHintClass } from "@/components/ui/styles";
import { cn } from "@/lib/utils";
import { formatIdr } from "@/lib/money/format-idr";
import { calculateExpression } from "../services/calculator";

function KeypadButton({
  label,
  aria,
  onClick,
  icon: Icon,
}: {
  label: string;
  aria: string;
  onClick: () => void;
  icon?: LucideIcon;
}) {
  return (
    <button
      type="button"
      className="grid min-h-[2.85rem] place-items-center rounded-[.7rem] border border-border bg-surface-subtle p-[.5rem] text-[.92rem] font-medium text-foreground hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2"
      aria-label={aria}
      onClick={onClick}
    >
      {Icon ? <Icon aria-hidden="true" size={20} strokeWidth={2} /> : label}
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
    >
      <div className="mb-[.85rem] grid gap-[.3rem] rounded-[.8rem] border border-border bg-surface-subtle p-[.9rem]">
        <input
          className="w-full min-h-[1.6rem] border-0 bg-transparent p-0 text-[.85rem] font-medium text-muted outline-none"
          aria-label="Calculator expression"
          value={expression}
          onChange={(event) => setExpression(event.target.value)}
          placeholder="25000 + 18000 + 7500"
          readOnly
        />
        <p className="m-0 text-[1.15rem] font-medium tracking-[-.03em]" aria-live="polite">
          {result ? formatIdr(result) : "—"}
        </p>
      </div>
      <FormMessage>{calculatorError}</FormMessage>
      <div className="grid grid-cols-[repeat(4,minmax(0,1fr))] gap-2">
        {["7", "8", "9"].map((key) => (
          <KeypadButton key={key} label={key} aria={key} onClick={() => append(key)} />
        ))}
        <KeypadButton label="/" aria="Divide" icon={Divide} onClick={() => append("/")} />
        {["4", "5", "6"].map((key) => (
          <KeypadButton key={key} label={key} aria={key} onClick={() => append(key)} />
        ))}
        <KeypadButton label="*" aria="Multiply" icon={X} onClick={() => append("*")} />
        {["1", "2", "3"].map((key) => (
          <KeypadButton key={key} label={key} aria={key} onClick={() => append(key)} />
        ))}
        <KeypadButton label="-" aria="Subtract" icon={Minus} onClick={() => append("-")} />
        <KeypadButton label="000" aria="Insert three zeros" onClick={() => append("000")} />
        <KeypadButton label="0" aria="Zero" onClick={() => append("0")} />
        <KeypadButton label="C" aria="Clear" onClick={clear} />
        <KeypadButton label="⌫" aria="Delete last character" icon={Delete} onClick={backspace} />
        <KeypadButton label="+" aria="Add" icon={Plus} onClick={() => append("+")} />
        <KeypadButton label="=" aria="Calculate result" icon={Equal} onClick={commit} />
      </div>
      <p className={cn(fieldHintClass, "mt-[.35rem] text-[.72rem]")}>
        Operators: +, −, ×, ÷. The result is rounded to the nearest rupiah.
      </p>
      <Button
        type="button"
        variant="primary"
        className="mt-[.9rem] w-full min-h-[2.6rem] p-[.55rem_.9rem] text-[.88rem]"
        disabled={!result}
        onClick={commit}
      >
        Use Amount
      </Button>
    </BottomSheet>
  );
}