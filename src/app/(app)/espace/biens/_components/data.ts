import { api } from "@/lib/api/client";
import { ApiError, unwrap } from "@/lib/api/errors";
import type { Schema } from "@/lib/api/types";

/*
 * Données partagées du module Biens : types, clés React Query et chargements complets
 * (bâtiments et lots d'un bien, toutes pages confondues).
 */

export type Property = Schema<"Property">;
export type Building = Schema<"Building">;
export type Unit = Schema<"Unit">;
export type UnitStatus = Schema<"UnitStatusEnum">;
export type UnitCategory = Schema<"UnitCategoryEnum">;

/** Premier élément = ressource : `invalidate: [PROPERTIES_KEY]` rafraîchit liste et fiches. */
export const PROPERTIES_KEY = ["properties"] as const;
export const BUILDINGS_KEY = ["buildings"] as const;
export const UNITS_KEY = ["units"] as const;

export const propertyKey = (id: number) => [...PROPERTIES_KEY, "detail", id] as const;
export const buildingsKey = (propertyId: number) => [...BUILDINGS_KEY, "property", propertyId] as const;
export const unitsKey = (propertyId: number) => [...UNITS_KEY, "property", propertyId] as const;

/** Garde-fou : 40 pages de 25 éléments, bien au-delà d'un bien réel. */
const MAX_PAGES = 40;

export async function fetchBuildings(propertyId: number): Promise<Building[]> {
  const buildings: Building[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const data = unwrap(
      await api.GET("/api/v1/properties/properties/{property_pk}/buildings/", {
        params: { path: { property_pk: propertyId }, query: { page } },
      }),
    );
    buildings.push(...data.results);
    if (!data.next) break;
  }
  return buildings;
}

export async function fetchUnits(propertyId: number): Promise<Unit[]> {
  const units: Unit[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const data = unwrap(await api.GET("/api/v1/properties/units/", { params: { query: { property: propertyId, page } } }));
    units.push(...data.results);
    if (!data.next) break;
  }
  return units;
}

/**
 * Suppression d'un bien, d'un bâtiment ou d'un lot. Les baux protègent leurs lots : l'API refuse alors la
 * suppression (aujourd'hui par une erreur serveur sans message), que l'on traduit en explication utile.
 */
export async function removeWithLeaseGuard(request: () => Promise<{ error?: unknown; response: Response }>, blocked: string) {
  try {
    unwrap(await request());
  } catch (error) {
    if (error instanceof ApiError && error.status >= 500) throw new ApiError(error.status, blocked);
    throw error;
  }
}

/** Taux d'occupation en pour cent (0 si aucun lot). */
export function occupancy(occupied: number, total: number): number {
  return total > 0 ? Math.round((occupied / total) * 100) : 0;
}

/** Principales villes où opèrent les agences (suggestions du formulaire et filtre de la liste). */
export const SENEGAL_CITIES = [
  "Dakar",
  "Pikine",
  "Guédiawaye",
  "Rufisque",
  "Diamniadio",
  "Thiès",
  "Mbour",
  "Saly",
  "Saint-Louis",
  "Touba",
  "Kaolack",
  "Ziguinchor",
];

/** « 12.5 » → « 12,5 m² ». */
export function formatSurface(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(value)} m²`;
}

/** Nombre facultatif saisi dans un champ texte : "" → null. */
export function optionalInteger(value: string): number | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : Number(trimmed);
}

/** Coordonnée saisie (virgule ou point) → chaîne décimale attendue par l'API, ou null si vide. */
export function optionalCoordinate(value: string): string | null {
  const trimmed = value.trim().replace(",", ".");
  return trimmed === "" ? null : trimmed;
}
