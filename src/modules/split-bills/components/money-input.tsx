"use client";

import { useId } from "react";
import { AmountInput } from "@/components/ui/amount-input";
import { Input } from "@/components/ui/input";
import { stripLeadingZeros } from "@/lib/money/input-format";

export function RupiahInput({
  value,
  onChange,
  id,
  className,
  ...props
}: {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "defaultValue"
>) {
  return (
    <AmountInput
      id={id}
      className={className}
      value={value}
      onChange={onChange}
      {...props}
    />
  );
}

export function QuantityInput({
  value,
  onChange,
  id,
  className,
  ...props
}: {
  value: number;
  onChange: (value: number) => void;
  id?: string;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <Input
      id={inputId}
      className={className}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={value === 0 ? "" : String(value)}
      onChange={(event) => {
        const digits = stripLeadingZeros(event.target.value);
        const parsed = digits === "" ? 0 : Number(digits);
        onChange(Number.isNaN(parsed) ? 0 : parsed);
      }}
      placeholder="1"
      {...props}
    />
  );
}