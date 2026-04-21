"use client";

/**
 * theme.tsx — minimal theme provider for CortexCFO.
 *
 * Design choice: rather than tokenize every marketing-page color
 * (which would touch hundreds of classes), we flip a single
 * `.theme-light` / `.theme-dark` class on <html>. Layout-level CSS
 * in globals.css then remaps the canvas, cards, borders, and text
 * so the pages read as either dark (default) or light.
 *
 * Persistence: localStorage key `cortexcfo-theme` with values
 * "light" | "dark" | "system". First paint reads directly from
 * localStorage via an inline script in layout.tsx so there's no
 * flash of wrong theme.
 */

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";
type Resolved = "light" | "dark";

interface ThemeCtx {
  theme: Theme;
  resolved: Resolved;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

const STORAGE_KEY = "cortexcfo-theme";

function systemPreference(): Resolved {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function applyToRoot(resolved: Resolved) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.classList.toggle("theme-light", resolved === "light");
  html.classList.toggle("theme-dark", resolved === "dark");
  // color-scheme hints to the UA for form controls + scrollbars
  html.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [resolved, setResolved] = useState<Resolved>("dark");

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = (typeof window !== "undefined"
      ? (localStorage.getItem(STORAGE_KEY) as Theme | null)
      : null) ?? "dark";
    setThemeState(stored);
    const r = stored === "system" ? systemPreference() : stored;
    setResolved(r);
    applyToRoot(r);
  }, []);

  // Track system preference when theme === "system"
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      const r: Resolved = mq.matches ? "light" : "dark";
      setResolved(r);
      applyToRoot(r);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, t);
    const r = t === "system" ? systemPreference() : t;
    setResolved(r);
    applyToRoot(r);
  };

  const toggle = () => setTheme(resolved === "dark" ? "light" : "dark");

  return (
    <Ctx.Provider value={{ theme, resolved, setTheme, toggle }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTheme(): ThemeCtx {
  const v = useContext(Ctx);
  if (!v) {
    // Fallback so components outside the provider don't crash
    return {
      theme: "dark",
      resolved: "dark",
      setTheme: () => {},
      toggle: () => {},
    };
  }
  return v;
}
