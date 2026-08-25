"use client";

import { useSyncExternalStore } from "react";

const THEMES = ["system", "light", "dark"] as const;

type Theme = (typeof THEMES)[number];

const LABELS: Record<Theme, string> = {
  system: "自動",
  light: "ライト",
  dark: "ダーク",
};

// 真実の置き場所は <html data-theme> ひとつ。localStorage は次回訪問のための控え。
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function getSnapshot(): Theme {
  const current = document.documentElement.dataset.theme;
  return current === "light" || current === "dark" ? current : "system";
}

function getServerSnapshot(): Theme {
  return "system";
}

function applyTheme(next: Theme) {
  if (next === "system") {
    localStorage.removeItem("theme");
    delete document.documentElement.dataset.theme;
  } else {
    localStorage.setItem("theme", next);
    document.documentElement.dataset.theme = next;
  }
  listeners.forEach((onChange) => onChange());
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <fieldset className="border-rule bg-background flex items-center gap-1 border p-0.5">
      <legend className="sr-only">配色</legend>
      {THEMES.map((value) => (
        <label
          key={value}
          className={`cursor-pointer px-2 py-1 text-xs tracking-wider transition-colors ${
            theme === value
              ? "bg-foreground text-background"
              : "text-muted hover:text-foreground"
          }`}
        >
          <input
            type="radio"
            name="theme"
            value={value}
            checked={theme === value}
            onChange={() => applyTheme(value)}
            className="sr-only"
          />
          {LABELS[value]}
        </label>
      ))}
    </fieldset>
  );
}
