"use client";

import { useId, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  formatThousands,
  stripLeadingZeros,
} from "@/lib/money/input-format";

export function AmountInput({
  name,
  defaultValue = "",
  value,
  onChange,
  prefix = "Rp",
  id,
  className,
  required,
  placeholder,
  ...props
}: {
  name?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (digits: string) => void;
  prefix?: string;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "defaultValue" | "type" | "name"
>) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [internal, setInternal] = useState(() => stripLeadingZeros(defaultValue));

  const isControlled = value !== undefined;
  const digits = isControlled ? stripLeadingZeros(value ?? "") : internal;
  const display = digits ? formatThousands(digits) : "";

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const el = event.target;
    const raw = el.value;
    const caret = el.selectionStart ?? raw.length;
    const digitsBefore = raw.slice(0, caret).replace(/\D/gu, "").length;
    const next = stripLeadingZeros(raw);
    if (isControlled) {
      onChange?.(next);
    } else {
      setInternal(next);
    }
    requestAnimationFrame(() => {
      const formatted = formatThousands(next);
      let pos = 0;
      let seen = 0;
      while (pos < formatted.length && seen < digitsBefore) {
        if (formatted[pos] !== ".") seen++;
        pos++;
      }
      el.setSelectionRange(pos, pos);
    });
  }

  return (
    <div className="relative">
      {prefix ? (
        <span
          className="pointer-events-none absolute top-1/2 left-[.8rem] -translate-y-1/2 text-[.88rem] font-medium text-muted"
          aria-hidden="true"
        >
          {prefix}
        </span>
      ) : null}
      <Input
        id={inputId}
        className={cn(className, prefix && "pl-[2.1rem]")}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={display}
        onChange={handleChange}
        placeholder={placeholder ?? "0"}
        required={required}
        {...props}
      />
      {name ? <input type="hidden" name={name} value={digits} /> : null}
    </div>
  );
}