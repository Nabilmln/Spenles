"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  formatThousands,
  stripLeadingZeros,
} from "@/lib/money/input-format";

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
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className="relative">
      <span
        className="pointer-events-none absolute top-1/2 left-[.8rem] -translate-y-1/2 text-[.88rem] font-medium text-muted"
        aria-hidden="true"
      >
        Rp
      </span>
      <Input
        id={inputId}
        className={cn(className, "pl-[2.1rem]")}
        inputMode="numeric"
        autoComplete="off"
        value={value ? formatThousands(value) : ""}
        onChange={(event) =>
          onChange(stripLeadingZeros(event.target.value))
        }
        placeholder="0"
        {...props}
      />
    </div>
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