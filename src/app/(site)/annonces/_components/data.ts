import "server-only";

import { cache } from "react";

import { publicApi } from "@/lib/api/server";
import type { components } from "@/lib/api/schema";

export type ListingDetail = components["schemas"]["PublicListingDetail"];

/** Identifiant d'annonce valide (entier positif) ou `null` : une URL fantaisiste mène au 404. */
export function parseListingId(raw: string): number | null {
  if (!/^\d{1,9}$/.test(raw)) return null;
  const id = Number(raw);
  return id > 0 ? id : null;
}

/**
 * Fiche publique d'une annonce, partagée entre `generateMetadata` et la page (un seul appel par rendu).
 * `null` si l'annonce n'existe pas ou n'est plus publiée (404 de l'API) ; toute autre erreur est levée
 * et affichée par `error.tsx`.
 */
export const getListing = cache(async (id: number): Promise<ListingDetail | null> => {
  const { data, response } = await publicApi.GET("/api/v1/public/listings/{id}/", { params: { path: { id } } });
  if (response.status === 404) return null;
  if (!data) throw new Error(`Fiche annonce ${id} : réponse ${response.status} de l'API.`);
  return data;
});
