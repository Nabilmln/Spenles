"use client";

import {
  CATEGORY_ICON_LIBRARY,
  CATEGORY_ICON_LABELS,
  CATEGORY_ICON_NAMES,
} from "../constants/category-icons";

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
    <fieldset className="category-icon-fieldset">
      <legend>Ikon</legend>
      <div className="category-icon-grid" role="radiogroup" aria-label="Pilih ikon">
        {CATEGORY_ICON_NAMES.map((iconName) => {
          const Icon = CATEGORY_ICON_LIBRARY[iconName];
          const selected = value === iconName;
          return (
            <label
              className={selected ? "category-icon-option category-icon-selected" : "category-icon-option"}
              key={iconName}
            >
              <input
                aria-label={CATEGORY_ICON_LABELS[iconName] ?? iconName}
                checked={selected}
                className="category-icon-input"
                name={name}
                onChange={() => onChange?.(iconName)}
                type="radio"
                value={iconName}
              />
              <span className="category-icon-glyph">
                <Icon aria-hidden="true" size={22} />
              </span>
              <span className="category-icon-name" aria-hidden="true">
                {CATEGORY_ICON_LABELS[iconName]?.replace("Ikon ", "") ?? iconName}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
