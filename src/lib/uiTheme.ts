/*
 * Apparence de l'espace connecté (personnaliseur, repris de Vireo) : couleur d'accent, schémas de la
 * barre latérale et de l'en-tête, style de coque, densité, largeur.
 *
 * Deux niveaux : l'apparence de l'agence (Organization.theme, choisie par ses administrateurs) et les
 * préférences de chaque utilisateur (ce navigateur), qui priment. Rien ne s'applique au site public,
 * qui reste clair et orange : AppShell pose les attributs à l'entrée de l'espace et les retire en sortant.
 */

import type { Schema } from "@/lib/api/types";

import { contrastRatio, darken, deriveRamp, lighten, parseHex, rgbString, toHex } from "./color";
import { COLLAPSED_KEY, UI_APPLIED_KEY, UI_STYLE_ID } from "./theme";

export type UiSettings = Schema<"OrganizationTheme">;
export type AccentName = NonNullable<UiSettings["accent"]>;
export type Scheme = NonNullable<UiSettings["sidebar"]>;
type LayoutKey = Exclude<keyof UiSettings, "accent_custom">;

const PERSONAL_PREFIX = "dahoo:ui:";
const CHANGE_EVENT = "dahoo:ui-change";

export const ACCENT_PRESETS: {
  value: Exclude<AccentName, "custom">;
  label: string;
  base: string;
}[] = [
  { value: "dahoo", label: "Dahoo", base: "#F7941D" },
  { value: "verdigris", label: "Vert-de-gris", base: "#1E856C" },
  { value: "cobalt", label: "Cobalt", base: "#2A5FCC" },
  { value: "indigo", label: "Indigo", base: "#4F46C9" },
  { value: "amethyst", label: "Améthyste", base: "#8A46B5" },
  { value: "magenta", label: "Magenta", base: "#C13C84" },
  { value: "terracotta", label: "Terracotta", base: "#C25339" },
  { value: "amber", label: "Ambre", base: "#C1820E" },
  { value: "olive", label: "Olive", base: "#647F1C" },
  { value: "forest", label: "Forêt", base: "#2C7A4B" },
  { value: "teal", label: "Sarcelle", base: "#10808F" },
  { value: "slate", label: "Ardoise", base: "#4A5A6B" },
  { value: "graphite", label: "Graphite", base: "#52514C" },
];

/** Attribut posé sur <html> pour chaque réglage, et valeur par défaut (= pas d'attribut). */
const ATTRIBUTES: Record<LayoutKey, readonly [attribute: string, fallback: string]> = {
  accent: ["data-ax-accent", "dahoo"],
  sidebar: ["data-ax-sidebar", "light"],
  header: ["data-ax-header", "light"],
  shell: ["data-ax-shell-style", "default"],
  sidebar_behavior: ["data-ax-sidebar-behavior", "collapsible"],
  page: ["data-ax-page", "regular"],
  width: ["data-ax-width", "fluid"],
};

export const UI_DEFAULTS: Required<Pick<UiSettings, LayoutKey>> = {
  accent: "dahoo",
  sidebar: "light",
  header: "light",
  shell: "default",
  sidebar_behavior: "collapsible",
  page: "regular",
  width: "fluid",
};

/** Retire les clés vides (le serveur refuse les valeurs nulles). */
export function cleanUi(settings: UiSettings): UiSettings {
  const clean: UiSettings = { ...settings };
  (Object.keys(clean) as (keyof UiSettings)[]).forEach((key) => clean[key] === undefined && delete clean[key]);
  if (clean.accent !== "custom") delete clean.accent_custom;
  return clean;
}

/** Préférences personnelles par-dessus l'apparence de l'agence ; la couleur libre suit son choix d'accent. */
export function mergeUi(agency: UiSettings, personal: UiSettings): UiSettings {
  const merged: UiSettings = { ...agency, ...personal };
  if (personal.accent) merged.accent_custom = personal.accent_custom;
  return cleanUi(merged);
}

const LIGHT_CANVAS = "#F6F8FC";
const DARK_CANVAS = "#0A0C11";
const LIGHT_INK = "#141B47";
const DARK_INK = "#0B0D12";

const bestInk = (fill: string, inks: string[]) =>
  inks.reduce((best, ink) => (contrastRatio(ink, fill) > contrastRatio(best, fill) ? ink : best));

/**
 * Couleur libre : rampe complète et rôles, en clair et en sombre, avec les mêmes garanties de
 * contraste que les presets (encre sur l'accent et texte coloré à 4.5:1 minimum).
 */
export function customAccentCss(hex: string): string | null {
  const base = parseHex(hex);
  if (!base || !/^#[0-9a-fA-F]{6}$/.test(hex)) return null;
  const ramp = deriveRamp(hex);
  const onLight = bestInk(hex, ["#FFFFFF", LIGHT_INK]);
  const hover = onLight === "#FFFFFF" ? ramp["--ax-accent-600"] : ramp["--ax-accent-400"];
  const text =
    ["--ax-accent-700", "--ax-accent-800", "--ax-accent-900"]
      .map((stop) => ramp[stop])
      .find((color) => contrastRatio(color, LIGHT_CANVAS) >= 4.5) ?? ramp["--ax-accent-900"];

  // En sombre : éclaircir jusqu'à être lisible sur le fond de l'application.
  let darkAccent = toHex(base);
  for (let t = 0.08; contrastRatio(darkAccent, DARK_CANVAS) < 4.5 && t <= 0.8; t += 0.08) {
    darkAccent = toHex(lighten(base, t));
  }
  // Rails en dégradé : plage foncée et encre blanche si elle tient, sinon plage claire et encre indigo.
  const deep = contrastRatio("#FFFFFF", ramp["--ax-accent-600"]) >= 4.5;
  const [gradientFrom, gradientTo] = deep ? [600, 800] : [300, 500];
  const darkRgb = parseHex(darkAccent) ?? base;
  const darkHover = toHex(lighten(darkRgb, 0.2));

  const light = {
    ...Object.fromEntries(Object.entries(ramp).filter(([prop]) => /^--ax-accent-\d+$/.test(prop))),
    "--ax-accent": "var(--ax-accent-500)",
    "--ax-accent-hover": hover,
    "--ax-accent-wash": "var(--ax-accent-50)",
    "--ax-on-accent": onLight,
    "--ax-accent-text": text,
    "--ax-focus-ring": "var(--ax-accent-500)",
    "--ax-link": "var(--ax-accent-700)",
    "--ax-accent-rgb": rgbString(hex),
    "--ax-gradient-from": `var(--ax-accent-${gradientFrom})`,
    "--ax-gradient-to": `var(--ax-accent-${gradientTo})`,
    "--ax-on-gradient": deep ? "#FFFFFF" : LIGHT_INK,
  };
  const dark = {
    "--ax-accent": darkAccent,
    "--ax-accent-hover": darkHover,
    "--ax-accent-wash": toHex(darken(base, 0.78)),
    "--ax-on-accent": bestInk(darkAccent, ["#FFFFFF", DARK_INK]),
    "--ax-accent-text": darkAccent,
    "--ax-link": darkHover,
    "--ax-focus-ring": darkHover,
    "--ax-accent-rgb": rgbString(darkAccent),
  };
  const block = (vars: Record<string, string>) =>
    Object.entries(vars)
      .map(([prop, value]) => `${prop}:${value};`)
      .join("");
  return `[data-ax-accent="custom"]{${block(light)}}[data-ax-theme="dark"][data-ax-accent="custom"]{${block(dark)}}`;
}

interface AppliedUi {
  /** Attributs à poser sur <html> (seulement les valeurs qui diffèrent du défaut). */
  a: Record<string, string>;
  /** Feuille de style de la couleur libre. */
  c?: string;
}

function computeApplied(settings: UiSettings): AppliedUi {
  const applied: AppliedUi = { a: {} };
  (Object.keys(ATTRIBUTES) as LayoutKey[]).forEach((key) => {
    const [attribute, fallback] = ATTRIBUTES[key];
    const value = settings[key];
    if (value && value !== fallback) applied.a[attribute] = value;
  });
  if (settings.accent === "custom") {
    const css = settings.accent_custom ? customAccentCss(settings.accent_custom) : null;
    if (css) applied.c = css;
    else delete applied.a["data-ax-accent"];
  }
  return applied;
}

function setAccentStyle(css: string | undefined): void {
  let style = document.getElementById(UI_STYLE_ID);
  if (!css) {
    style?.remove();
    return;
  }
  if (!style) {
    style = document.createElement("style");
    style.id = UI_STYLE_ID;
    document.head.appendChild(style);
  }
  if (style.textContent !== css) style.textContent = css;
}

/** Les graphiques relisent leurs couleurs sur cet évènement (voir ApexChart). */
function notifyRepaint(): void {
  window.dispatchEvent(new Event("dahoo:theme-change"));
}

export function applyUi(settings: UiSettings): void {
  const root = document.documentElement;
  const applied = computeApplied(settings);
  Object.values(ATTRIBUTES).forEach(([attribute]) => {
    const value = applied.a[attribute];
    if (value) root.setAttribute(attribute, value);
    else root.removeAttribute(attribute);
  });
  setAccentStyle(applied.c);
  // « Dépliée » et « Compacte » verrouillent la barre latérale : le repli manuel ne s'applique plus.
  const locked = Boolean(applied.a["data-ax-sidebar-behavior"]);
  const collapsed = !locked && readStorage(COLLAPSED_KEY) === "1";
  if (collapsed) root.setAttribute("data-ax-collapsed", "");
  else root.removeAttribute("data-ax-collapsed");
  writeStorage(UI_APPLIED_KEY, Object.keys(applied.a).length || applied.c ? JSON.stringify(applied) : null);
  notifyRepaint();
}

/** Sortie de l'espace connecté : le site public retrouve l'apparence Dahoo d'origine. */
export function clearUi(): void {
  const root = document.documentElement;
  Object.values(ATTRIBUTES).forEach(([attribute]) => root.removeAttribute(attribute));
  setAccentStyle(undefined);
  notifyRepaint();
}

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Stockage indisponible : l'apparence vaut pour la session en cours seulement.
  }
}

/* ── Préférences personnelles (par utilisateur, dans ce navigateur) ── */

export const personalKey = (userId: number) => `${PERSONAL_PREFIX}${userId}`;

export function subscribeUi(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Instantané brut (chaîne) : stable pour useSyncExternalStore. */
export function readPersonalRaw(userId: number | undefined): string | null {
  return userId === undefined ? null : readStorage(personalKey(userId));
}

export function parseUi(raw: string | null | undefined): UiSettings {
  if (!raw) return {};
  try {
    const value: unknown = JSON.parse(raw);
    return value && typeof value === "object" ? cleanUi(value as UiSettings) : {};
  } catch {
    return {};
  }
}

export function writePersonal(userId: number, settings: UiSettings): void {
  const clean = cleanUi(settings);
  writeStorage(personalKey(userId), Object.keys(clean).length ? JSON.stringify(clean) : null);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
