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
    <span className="select">
      <select
        aria-label={ariaLabel}
        className="select-hidden"
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
        className={cn("select-trigger", className)}
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
        <span className={cn("select-value", !currentValue && placeholder && "select-placeholder")}>
          {currentValue ? selectedText : placeholder ?? selectedText}
        </span>
        <ChevronDown aria-hidden="true" className="select-chevron" size={18} />
      </button>

      {open ? (
        <div className="dd-backdrop" onClick={() => setOpen(false)}>
          <div
            aria-label={ariaLabel}
            className="dd-panel"
            id={listboxId}
            onClick={(event) => event.stopPropagation()}
            ref={listboxRef}
            role="listbox"
            style={anchorStyle}
          >
            <div className="dd-panel-title" aria-hidden="true">
              {ariaLabel}
            </div>
            <div className="dd-options">
              {options.map((option) => {
                const active = option.value === currentValue;
                return (
                  <button
                    aria-selected={active}
                    className={cn("dd-option", active && "dd-option-active")}
                    data-value={option.value}
                    key={option.value}
                    onClick={() => commitValue(option.value)}
                    role="option"
                    tabIndex={-1}
                    type="button"
                  >
                    <span className="dd-option-label">{option.label}</span>
                    {active ? (
                      <Check
                        aria-hidden="true"
                        className="dd-option-check"
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