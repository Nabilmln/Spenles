"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { useTransition } from "react";
import { setThemeAction } from "@/modules/profiles/actions/update-profile";
import { cn } from "@/lib/utils";

const options = [
  { value: "system", label: "Sistem", icon: Laptop },
  { value: "light", label: "Terang", icon: Sun },
  { value: "dark", label: "Gelap", icon: Moon },
] as const;

export function ThemeSwitcher({ currentTheme }: { currentTheme: "system" | "light" | "dark" }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="theme-switcher" aria-label="Pilih tema">
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          className={cn("theme-option", currentTheme === value && "theme-option-active")}
          disabled={pending}
          aria-pressed={currentTheme === value}
          aria-label={`Tema ${label}`}
          onClick={() => startTransition(async () => {
            document.documentElement.className = `theme-${value}`;
            await setThemeAction(value);
          })}
        >
          <Icon size={17} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
