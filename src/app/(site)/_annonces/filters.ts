/*
 * Filtres des listes d'annonces /louer et /acheter : lecture et nettoyage des paramètres d'URL,
 * construction des liens (pagination, retrait d'un filtre) et des titres.
 *
 * Les paramètres d'URL reprennent les noms de l'API publique (city, category, min_price, max_price,
 * min_bedrooms, q, ordering, page) : un lien construit ailleurs sur le site (accueil, fiche agence…)
 * peut donc viser directement /louer?city=Dakar&category=APARTMENT.
 */

import type { operations } from "@/lib/api/schema";
import { UNIT_CATEGORY } from "@/lib/labels";

export type ListingType = "RENT" | "SALE";
export type ListingsQuery = NonNullable<operations["v1_public_listings_list"]["parameters"]["query"]>;
export type Category = NonNullable<ListingsQuery["category"]>;
export type Ordering = "-published_at" | "price" | "-price";
export type RawSearchParams = Record<string, string | string[] | undefined>;

/** Nombre d'annonces par page (grille de 3 colonnes sur bureau). */
export const PAGE_SIZE = 12;
export const DEFAULT_ORDERING: Ordering = "-published_at";

export const ORDERINGS: { value: Ordering; label: string }[] = [
  { value: "-published_at", label: "Plus récents" },
  { value: "price", label: "Prix croissant" },
  { value: "-price", label: "Prix décroissant" },
];

export const CATEGORIES = Object.keys(UNIT_CATEGORY) as Category[];

/** Pluriel des types de bien, pour les titres (« Appartements à louer à Dakar »). */
const CATEGORY_PLURAL: Record<Category, string> = {
  APARTMENT: "Appartements",
  HOUSE: "Maisons et villas",
  STUDIO: "Studios",
  OFFICE: "Bureaux",
  SHOP: "Locaux commerciaux",
  LAND: "Terrains",
};

export const BEDROOM_CHOICES = [1, 2, 3, 4, 5] as const;

export const LISTING_PAGES: Record<ListingType, { path: string; verb: string; title: string; crumb: string }> = {
  RENT: { path: "/louer", verb: "à louer", title: "Biens à louer", crumb: "Louer" },
  SALE: { path: "/acheter", verb: "à vendre", title: "Biens à vendre", crumb: "Acheter" },
};

export interface ListingFilters {
  city?: string;
  category?: Category;
  min_price?: number;
  max_price?: number;
  min_bedrooms?: number;
  q?: string;
  ordering: Ordering;
  page: number;
}

/** Clés de filtre effaçables une à une (tout sauf le tri et la page). */
export type FilterKey = "city" | "category" | "min_price" | "max_price" | "min_bedrooms" | "q";

const MAX_PRICE = 1_000_000_000_000;
const MAX_PAGE = 1000;

function first(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

/** Entier positif : accepte « 150 000 » ou « 150000 » ; tout le reste est ignoré. */
function positiveInt(value: string | undefined, max: number): number | undefined {
  if (!value) return undefined;
  const digits = value.replace(/[\s  .]/g, "");
  if (!/^\d+$/.test(digits)) return undefined;
  const parsed = Number(digits);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) return undefined;
  return Math.min(parsed, max);
}

function isCategory(value: string | undefined): value is Category {
  return value !== undefined && (CATEGORIES as string[]).includes(value);
}

function isOrdering(value: string | undefined): value is Ordering {
  return ORDERINGS.some((option) => option.value === value);
}

/**
 * Valide et nettoie les paramètres d'URL. `cities` (issues des statistiques) sert à rétablir
 * l'orthographe officielle d'une ville saisie en minuscules (« dakar » → « Dakar »).
 */
export function parseFilters(params: RawSearchParams, cities: string[] = []): ListingFilters {
  const rawCity = first(params.city)?.slice(0, 80);
  const city = rawCity ? (cities.find((name) => name.toLowerCase() === rawCity.toLowerCase()) ?? rawCity) : undefined;

  const rawCategory = first(params.category)?.toUpperCase();
  let min_price = positiveInt(first(params.min_price), MAX_PRICE);
  let max_price = positiveInt(first(params.max_price), MAX_PRICE);
  if (min_price !== undefined && max_price !== undefined && min_price > max_price) {
    [min_price, max_price] = [max_price, min_price];
  }
  const bedrooms = positiveInt(first(params.min_bedrooms), 20);
  const ordering = first(params.ordering);

  return {
    city,
    category: isCategory(rawCategory) ? rawCategory : undefined,
    min_price,
    max_price,
    min_bedrooms: bedrooms,
    q: first(params.q)?.slice(0, 100),
    ordering: isOrdering(ordering) ? ordering : DEFAULT_ORDERING,
    page: positiveInt(first(params.page), MAX_PAGE) ?? 1,
  };
}

/** Paramètres envoyés à l'API publique. */
export function apiQuery(listingType: ListingType, filters: ListingFilters): ListingsQuery {
  return {
    listing_type: listingType,
    city: filters.city,
    category: filters.category,
    min_price: filters.min_price,
    max_price: filters.max_price,
    min_bedrooms: filters.min_bedrooms,
    q: filters.q,
    ordering: filters.ordering,
    page: filters.page,
    page_size: PAGE_SIZE,
  };
}

/** Paramètres d'URL publics, sans valeur vide ni valeur par défaut (tri récent, page 1). */
export function searchString(filters: ListingFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.city) params.set("city", filters.city);
  if (filters.category) params.set("category", filters.category);
  if (filters.min_price !== undefined) params.set("min_price", String(filters.min_price));
  if (filters.max_price !== undefined) params.set("max_price", String(filters.max_price));
  if (filters.min_bedrooms !== undefined) params.set("min_bedrooms", String(filters.min_bedrooms));
  if (filters.ordering !== DEFAULT_ORDERING) params.set("ordering", filters.ordering);
  if (filters.page > 1) params.set("page", String(filters.page));
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function pageHref(path: string, filters: ListingFilters, page: number): string {
  return `${path}${searchString({ ...filters, page })}`;
}

export function withoutFilter(path: string, filters: ListingFilters, key: FilterKey): string {
  return `${path}${searchString({ ...filters, [key]: undefined, page: 1 })}`;
}

export function hasActiveFilters(filters: ListingFilters): boolean {
  return (
    filters.city !== undefined ||
    filters.category !== undefined ||
    filters.min_price !== undefined ||
    filters.max_price !== undefined ||
    filters.min_bedrooms !== undefined ||
    filters.q !== undefined
  );
}

export function categoryLabel(category: Category): string {
  return UNIT_CATEGORY[category]?.label ?? category;
}

/** Titre de la liste selon les filtres : « Appartements à louer à Dakar », « Biens à vendre »… */
export function listingHeadline(listingType: ListingType, filters: Pick<ListingFilters, "category" | "city">): string {
  const { subject, verb, place } = listingHeadlineParts(listingType, filters);
  return `${subject} ${verb}${place}`;
}

/** Morceaux du titre, pour mettre la transaction en italique dans le <h1> (« Biens *à louer* à Dakar »). */
export function listingHeadlineParts(
  listingType: ListingType,
  filters: Pick<ListingFilters, "category" | "city">,
): { subject: string; verb: string; place: string } {
  return {
    subject: filters.category ? CATEGORY_PLURAL[filters.category] : "Biens",
    verb: LISTING_PAGES[listingType].verb,
    place: filters.city ? ` à ${filters.city}` : "",
  };
}
