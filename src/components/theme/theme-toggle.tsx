"use client";

import { Moon, Sun } from "lucide-react";
import { useState, useTransition } from "react";
import { setThemeAction } from "@/modules/profiles/actions/update-profile";
import { iconButtonClass } from "@/components/ui/styles";

export function ThemeToggle({ currentTheme }: { currentTheme: "system" | "light" | "dark" }) {
  const [, startTransition] = useTransition();
  const [theme, setTheme] = useState<"light" | "dark">(
    currentTheme === "dark" ? "dark" : "light",
  );

  const dark = theme === "dark";
  const Icon = dark ? Moon : Sun;
  const label = dark ? "Enable light mode" : "Enable dark mode";

  function toggle() {
    const next = dark ? "light" : "dark";
    document.documentElement.className = `theme-${next}`;
    setTheme(next);
    startTransition(async () => {
      await setThemeAction(next);
    });
  }

  return (
    <button
      type="button"
      className={`${iconButtonClass}`}
      onClick={toggle}
      aria-label={label}
      title={label}
    >
      <Icon size={19} aria-hidden="true" />
    </button>
  );
}