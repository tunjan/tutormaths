"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

/** Compact light/dark switch. Avoids a hydration mismatch by waiting to mount. */
export function ThemeToggle({ presentation = "icon" }: { presentation?: "icon" | "menu" }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  if (presentation === "menu") {
    return (
      <Button
        variant="ghost"
        size="default"
        className="w-full justify-start"
        onClick={() => setTheme(isDark ? "light" : "dark")}
      >
        {isDark ? <Sun data-icon="inline-start" /> : <Moon data-icon="inline-start" />}
        {label}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={label}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  );
}
