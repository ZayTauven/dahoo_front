import "server-only";

import type { Metadata } from "next";
import { cache } from "react";

import { publicApi } from "@/lib/api/server";

import {
  DEFAULT_ORDERING,
  LISTING_PAGES,
  listingHeadline,
  parseFilters,
  searchString,
  type ListingType,
  type RawSearchParams,
} from "./filters";

/**
 * Villes proposées dans les filtres (statistiques publiques). Partagé entre generateMetadata et la page
 * pendant un même rendu ; une panne de l'API donne une liste vide (le champ ville devient libre).
 */
export const loadCities = cache(async (): Promise<string[]> => {
  try {
    const { data } = await publicApi.GET("/api/v1/public/stats/");
    return data?.cities.map((entry) => entry.city).filter(Boolean) ?? [];
  } catch {
    return [];
  }
});

/**
 * Métadonnées d'une liste d'annonces : titre selon les filtres (« Appartements à louer à Dakar »),
 * adresse canonique sans pagination ni tri, recherche libre non indexée.
 */
export async function listingsMetadata(listingType: ListingType, params: RawSearchParams): Promise<Metadata> {
  const filters = parseFilters(params, await loadCities());
  const { path, verb } = LISTING_PAGES[listingType];
  const headline = listingHeadline(listingType, filters);
  const title = filters.page > 1 ? `${headline} (page ${filters.page})` : headline;
  const description =
    `${headline} : annonces publiées par des agences immobilières partenaires de Dahoo au Sénégal. ` +
    `Photos, prix en FCFA, biens ${verb} de Dakar à la Petite-Côte et demande de visite en ligne.`;
  const canonical = `${path}${searchString({ ...filters, page: 1, ordering: DEFAULT_ORDERING })}`;

  return {
    title,
    description,
    alternates: { canonical },
    // Les pages de recherche libre ne sont pas indexées (contenu instable), mais leurs liens sont suivis.
    robots: filters.q ? { index: false, follow: true } : undefined,
    openGraph: { title: `${title} · Dahoo`, description, url: canonical, type: "website", locale: "fr_SN" },
  };
}
