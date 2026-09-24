"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";

import { applyCollapsed, applyTheme, readMode, type ResolvedTheme, type ThemeMode } from "@/lib/theme";

interface ThemeContextValue {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  collapsed: boolean;
  toggleCollapsed: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/*
 * La source de vérité est l'état de <html> (posé avant l'hydratation par THEME_SCRIPT) :
 * React s'y abonne via useSyncExternalStore. Le rendu serveur reçoit des valeurs neutres.
 */
const CHANGE_EVENT = "dahoo:theme-change";

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

function notify(): void {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

const readResolved = (): ResolvedTheme =>
  document.documentElement.getAttribute("data-ax-theme") === "dark" ? "dark" : "light";
const readCollapsed = (): boolean => document.documentElement.hasAttribute("data-ax-collapsed");

export function ThemeProvider({ children }: { children: ReactNode }) {
  const mode = useSyncExternalStore(subscribe, readMode, () => "system" as ThemeMode);
  const resolved = useSyncExternalStore(subscribe, readResolved, () => "light" as ResolvedTheme);
  const collapsed = useSyncExternalStore(subscribe, readCollapsed, () => false);

  // En mode « système », suivre les changements du système d'exploitation.
  useEffect(() => {
    if (mode !== "system") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      applyTheme("system");
      notify();
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    applyTheme(next);
    notify();
  }, []);

  const toggleTheme = useCallback(() => setMode(readResolved() === "dark" ? "light" : "dark"), [setMode]);

  const toggleCollapsed = useCallback(() => {
    applyCollapsed(!readCollapsed());
    notify();
  }, []);

  const value = useMemo(
    () => ({ mode, resolved, setMode, toggleTheme, collapsed, toggleCollapsed }),
    [mode, resolved, setMode, toggleTheme, collapsed, toggleCollapsed],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme doit être utilisé dans <ThemeProvider>.");
  return value;
}
