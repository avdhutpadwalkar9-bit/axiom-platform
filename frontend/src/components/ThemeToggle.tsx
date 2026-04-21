"use client";

/**
 * ThemeToggle — round pill button that flips the site theme.
 *
 * Lives in SiteNav on every marketing page and in the AppShell on
 * every dashboard page, so the toggle is always one click away.
 */

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useEffect, useState } from "react";

export default function ThemeToggle({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { resolved, toggle } = useTheme();
  // Avoid hydration mismatch — render a neutral ghost on first paint,
  // swap to the real icon once we know the resolved theme.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const size = compact ? "w-8 h-8" : "w-9 h-9";
  const icon = "w-4 h-4";

  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        className={`${size} ${className} rounded-full border border-white/10 bg-white/[0.04]`}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${resolved === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${resolved === "dark" ? "light" : "dark"} mode`}
      className={`${size} ${className} inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/[0.08] hover:border-white/25 transition-all active:scale-95`}
    >
      {resolved === "dark" ? (
        <Sun className={icon} />
      ) : (
        <Moon className={icon} />
      )}
    </button>
  );
}
