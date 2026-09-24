import { formatNumber } from "@/lib/format";

/** Mots ignorés pour les initiales : « Agence Démo Teranga » → « DT », « Keur Immo » → « KI ». */
const IGNORED_WORDS = new Set(["agence", "immobilier", "immobiliere", "immobilière", "de", "des", "du", "la", "le", "les", "et", "sarl", "sa", "suarl"]);

/** Monogramme d'une agence (deux lettres au plus), en l'absence de logo. */
export function agencyInitials(name: string): string {
  const words = name
    .replace(/[’']/g, " ")
    .split(/[\s-]+/)
    .filter(Boolean);
  const meaningful = words.filter((word) => !IGNORED_WORDS.has(word.toLocaleLowerCase("fr")));
  const source = meaningful.length > 0 ? meaningful : words;
  const letters = source.slice(0, 2).map((word) => word.charAt(0));
  return letters.join("").toLocaleUpperCase("fr") || "?";
}

/** « 1 annonce », « 12 annonces ». */
export function countLabel(count: number, singular: string, plural: string): string {
  return `${formatNumber(count)} ${count > 1 ? plural : singular}`;
}

/**
 * Numéro sénégalais lisible : « +221338210000 » → « +221 33 821 00 00 ».
 * Les autres formats sont rendus tels quels.
 */
export function formatPhone(phone: string): string {
  const compact = phone.replace(/[\s.-]/g, "");
  const match = /^(?:\+221|00221)?(\d{2})(\d{3})(\d{2})(\d{2})$/.exec(compact);
  if (!match) return phone;
  const local = `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
  return compact.startsWith("+221") || compact.startsWith("00221") ? `+221 ${local}` : local;
}

/** Valeur de `href` pour un lien `tel:` (sans espaces). */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** Numéro de page lu dans l'URL (`?page=`), 1 par défaut. */
export function pageParam(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw);
  return Number.isInteger(page) && page > 0 ? page : 1;
}
