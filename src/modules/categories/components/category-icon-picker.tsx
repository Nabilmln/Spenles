"use client";

import {
  CATEGORY_ICON_LIBRARY,
  CATEGORY_ICON_LABELS,
  CATEGORY_ICON_NAMES,
} from "../constants/category-icons";
import { cn } from "@/lib/utils";

const iconOptionClass =
  "relative grid cursor-pointer place-items-center gap-[.2rem] rounded-[.8rem] border border-border bg-surface-subtle p-[.45rem_.2rem] text-center text-muted focus-within:outline-2 focus-within:outline-primary-500 focus-within:outline-offset-2";

export function CategoryIconPicker({
  value,
  name = "icon",
  onChange,
}: {
  value: string | null;
  name?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <fieldset className="m-0 grid gap-[.5rem] border-0 p-0">
      <legend className="mb-[.25rem] text-[.86rem] font-medium">Icon</legend>
      <div className="grid grid-cols-[repeat(4,minmax(0,1fr))] gap-[.5rem]" role="radiogroup" aria-label="Choose icon">
        {CATEGORY_ICON_NAMES.map((iconName) => {
          const Icon = CATEGORY_ICON_LIBRARY[iconName];
          const selected = value === iconName;
          return (
            <label
              className={cn(iconOptionClass, selected && "border-primary-500 bg-primary-50 text-primary-700")}
              key={iconName}
            >
              <input
                aria-label={CATEGORY_ICON_LABELS[iconName] ?? iconName}
                checked={selected}
                className="pointer-events-none absolute opacity-0"
                name={name}
                onChange={() => onChange?.(iconName)}
                type="radio"
                value={iconName}
              />
              <span className="grid place-items-center">
                <Icon aria-hidden="true" size={22} />
              </span>
              <span className="text-[.7rem] font-medium" aria-hidden="true">
                {CATEGORY_ICON_LABELS[iconName]?.replace(" icon", "") ?? iconName}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
