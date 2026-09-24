/*
 * Thème Dahoo : clair / sombre / système, et repli de la sidebar de l'espace agence.
 * Simplification du personnaliseur Vireo (la charte est fixe : pas d'accents, de RTL ni de dispositions).
 */

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_KEY = "dahoo:theme";
export const COLLAPSED_KEY = "dahoo:sidebar-collapsed";

/**
 * Exécuté dans <head> avant tout rendu (voir le guide Next « preventing-flash-before-hydration ») :
 * applique le thème mémorisé sur <html> pour éviter un flash de la mauvaise couleur.
 */
export const THEME_SCRIPT = `(function(){try{
var d=document.documentElement,s=window.localStorage,m=s.getItem("${THEME_KEY}")||"system";
var dark=m==="dark"||(m==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);
d.setAttribute("data-ax-theme",dark?"dark":"light");
if(s.getItem("${COLLAPSED_KEY}")==="1")d.setAttribute("data-ax-collapsed","");
}catch(e){document.documentElement.setAttribute("data-ax-theme","light");}})();`;

export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode !== "system") return mode;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function readMode(): ThemeMode {
  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

export function applyTheme(mode: ThemeMode): ResolvedTheme {
  const resolved = resolveTheme(mode);
  document.documentElement.setAttribute("data-ax-theme", resolved);
  try {
    if (mode === "system") window.localStorage.removeItem(THEME_KEY);
    else window.localStorage.setItem(THEME_KEY, mode);
  } catch {
    // Stockage indisponible : le thème s'applique pour la session en cours seulement.
  }
  return resolved;
}

export function applyCollapsed(collapsed: boolean): void {
  const root = document.documentElement;
  if (collapsed) root.setAttribute("data-ax-collapsed", "");
  else root.removeAttribute("data-ax-collapsed");
  try {
    window.localStorage.setItem(COLLAPSED_KEY, collapsed ? "1" : "0");
  } catch {
    // Préférence non mémorisée.
  }
}
