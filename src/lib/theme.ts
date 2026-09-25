/*
 * Thème Dahoo : clair / sombre / système, et repli de la sidebar de l'espace agence.
 * L'apparence personnalisable (accents, schémas, densité) est dans uiTheme.ts.
 */

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_KEY = "dahoo:theme";
export const COLLAPSED_KEY = "dahoo:sidebar-collapsed";
/** Dernière apparence appliquée par le personnaliseur (voir uiTheme.ts), relue ci-dessous. */
export const UI_APPLIED_KEY = "dahoo:ui-applied";
export const UI_STYLE_ID = "dahoo-ui-accent";

/**
 * Exécuté dans <head> avant tout rendu (voir le guide Next « preventing-flash-before-hydration ») :
 * applique le thème mémorisé sur <html> pour éviter un flash de la mauvaise couleur.
 * Seul l'espace connecté suit la préférence et l'apparence personnalisée (accent, barres, densité) :
 * le site public et la connexion restent en clair, aux couleurs Dahoo.
 */
export const THEME_SCRIPT = `(function(){try{
var d=document.documentElement,s=window.localStorage,m=s.getItem("${THEME_KEY}")||"system";
var p=window.location.pathname,app=p.indexOf("/espace")===0||p.indexOf("/plateforme")===0;
var dark=app&&(m==="dark"||(m==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches));
d.setAttribute("data-ax-theme",dark?"dark":"light");
if(s.getItem("${COLLAPSED_KEY}")==="1")d.setAttribute("data-ax-collapsed","");
if(app){var u=JSON.parse(s.getItem("${UI_APPLIED_KEY}")||"null");if(u&&u.a){for(var k in u.a)d.setAttribute(k,u.a[k]);
if(u.a["data-ax-sidebar-behavior"])d.removeAttribute("data-ax-collapsed");
if(u.c){var st=document.createElement("style");st.id="${UI_STYLE_ID}";st.textContent=u.c;document.head.appendChild(st);}}}
}catch(e){document.documentElement.setAttribute("data-ax-theme","light");}})();`;

/**
 * Le site public et la connexion n'existent qu'en clair (décision du 2026-09-24) : seul l'espace
 * connecté suit la préférence de l'utilisateur. Même règle que dans THEME_SCRIPT.
 */
export function isThemedPath(pathname: string): boolean {
  return pathname.startsWith("/espace") || pathname.startsWith("/plateforme");
}

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
