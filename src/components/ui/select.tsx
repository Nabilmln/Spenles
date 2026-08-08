"use client";

import {
  Children,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type OptionValue = { value: string; label: ReactNode };

type SelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "children" | "onChange" | "value" | "defaultValue"
> & {
  children: ReactNode;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
};

function collectOptions(children: ReactNode): OptionValue[] {
  const result: OptionValue[] = [];
  Children.forEach(children, (child) => {
    if (child && typeof child === "object" && "type" in child) {
      const el = child as {
        type: unknown;
        props?: { value?: unknown; children?: ReactNode };
      };
      if (
        el.type === "option" &&
        el.props &&
        typeof el.props.value === "string"
      ) {
        result.push({ value: el.props.value, label: el.props.children });
      }
    }
  });
  return result;
}

export function Select({
  className,
  children,
  value: valueProp,
  defaultValue,
  placeholder,
  onChange,
  "aria-label": ariaLabel,
  id: idProp,
  name,
  disabled,
  required,
  ...rest
}: SelectProps) {
  const options = useMemo(() => collectOptions(children), [children]);
  const ownId = useId();
  const listboxId = `${idProp ?? ownId}-listbox`;
  const selectRef = useRef<HTMLSelectElement>(null);

  const isControlled = valueProp !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(
    () => String(defaultValue ?? ""),
  );
  const currentValue = isControlled ? (valueProp ?? "") : uncontrolledValue;

  const selectedText = useMemo(() => {
    const match = options.find((option) => option.value === currentValue);
    if (match) return match.label;
    const placeholderOption = options.find((option) => option.value === "");
    return placeholderOption ? placeholderOption.label : currentValue;
  }, [options, currentValue]);

  const [open, setOpen] = useState(false);
  const [anchorStyle, setAnchorStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  function openPanel() {
    setOpen(true);
    if (typeof window !== "undefined" && window.innerWidth >= 861 && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setAnchorStyle({
        position: "fixed",
        top: rect.bottom + 8,
        left: rect.left,
        width: Math.max(rect.width, 12),
      });
    }
  }

  useEffect(() => {
    if (open) {
      const el = listboxRef.current?.querySelector<HTMLElement>(
        `[data-value="${CSS.escape(currentValue)}"]`,
      );
      const focusTarget =
        el ?? listboxRef.current?.querySelector<HTMLElement>("[data-value]");
      focusTarget?.focus();
    }
  }, [open, currentValue]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function commitValue(next: string) {
    const native = selectRef.current;
    if (native) {
      native.value = next;
      onChange?.({
        target: native,
        currentTarget: native,
      } as unknown as React.ChangeEvent<HTMLSelectElement>);
    }
    if (!isControlled) setUncontrolledValue(next);
    setOpen(false);
  }

  return (
    <span className="relative block w-full">
      <select
        aria-label={ariaLabel}
        className="absolute -m-px size-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0_0_0_0)]"
        defaultValue={defaultValue}
        disabled={disabled}
        id={idProp ?? ownId}
        name={name}
        onChange={(event) => {
          if (isControlled) {
            onChange?.(event);
          } else {
            setUncontrolledValue(event.target.value);
            onChange?.(event);
          }
        }}
        ref={selectRef}
        required={required}
        tabIndex={-1}
        {...(isControlled ? { value: valueProp } : {})}
        {...rest}
      >
        {children}
      </select>

      <button
        aria-controls={open ? listboxId : undefined}
        aria-disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className={cn(
          "flex w-full min-h-[2.9rem] cursor-pointer items-center justify-between gap-[.5rem] rounded-[.72rem] border border-border bg-surface-subtle px-[.85rem] py-[.72rem] text-left font-medium text-foreground transition-[border,box-shadow] duration-150 focus:border-primary-500 focus:shadow-[0_0_0_3px_rgb(59_130_246/12%)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-65",
          className,
        )}
        disabled={disabled}
        onClick={() => {
          if (open) {
            setOpen(false);
          } else {
            openPanel();
          }
        }}
        ref={triggerRef}
        type="button"
      >
        <span className={cn("min-w-0 flex-1 truncate text-[.88rem]", !currentValue && placeholder && "font-medium text-muted")}>
          {currentValue ? selectedText : placeholder ?? selectedText}
        </span>
        <ChevronDown aria-hidden="true" className="shrink-0 text-muted" size={18} />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-[rgb(15_17_21/45%)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] min-[861px]:pointer-events-none min-[861px]:items-start min-[861px]:justify-start min-[861px]:bg-transparent min-[861px]:p-0"
          onClick={() => setOpen(false)}
        >
          <div
            aria-label={ariaLabel}
            className="grid w-[min(28rem,100%)] max-h-[70vh] grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-[1.15rem_1.15rem_1rem_1rem] border border-border bg-surface shadow-card min-[861px]:absolute min-[861px]:z-[5] min-[861px]:w-[min(24rem,calc(100vw-2rem))]"
            id={listboxId}
            onClick={(event) => event.stopPropagation()}
            ref={listboxRef}
            role="listbox"
            style={anchorStyle}
          >
            <div className="px-4 pt-4 pb-[.4rem] text-[.76rem] font-medium uppercase tracking-[.04em] text-muted" aria-hidden="true">
              {ariaLabel}
            </div>
            <div className="overflow-y-auto px-[.4rem] pb-[.4rem]">
              {options.map((option) => {
                const active = option.value === currentValue;
                return (
                  <button
                    aria-selected={active}
                    className={cn(
                      "flex w-full min-h-[2.7rem] cursor-pointer items-center justify-between gap-[.6rem] rounded-[.7rem] border-0 bg-transparent px-[.75rem] py-[.55rem] text-left text-[.9rem] font-medium text-foreground hover:bg-surface-subtle focus-visible:bg-surface-subtle",
                      active && "bg-primary-50 text-primary-700",
                    )}
                    data-value={option.value}
                    key={option.value}
                    onClick={() => commitValue(option.value)}
                    role="option"
                    tabIndex={-1}
                    type="button"
                  >
                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                    {active ? (
                      <Check
                        aria-hidden="true"
                        className="shrink-0 text-primary-600"
                        size={18}
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </span>
  );
}