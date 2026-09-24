import "server-only";

import { publicApi } from "@/lib/api/server";
import type { Schema } from "@/lib/api/types";

export type HomeStats = Schema<"PublicStats">;
export type HomeListing = Schema<"PublicListing">;

const EMPTY_STATS: HomeStats = { listings_count: 0, agencies_count: 0, by_type: [], by_category: [], cities: [] };

/**
 * Compteurs de l'accueil. Une API indisponible ne doit pas casser la page :
 * on renvoie des compteurs vides et chaque section s'adapte.
 */
export async function getHomeStats(): Promise<HomeStats> {
  try {
    const { data } = await publicApi.GET("/api/v1/public/stats/");
    return data ?? EMPTY_STATS;
  } catch {
    return EMPTY_STATS;
  }
}

/** Dernières annonces publiées (les plus récentes d'abord). */
export async function getLatestListings(count = 6): Promise<HomeListing[]> {
  try {
    const { data } = await publicApi.GET("/api/v1/public/listings/", {
      params: { query: { page_size: count, ordering: "-published_at" } },
    });
    return data?.results ?? [];
  } catch {
    return [];
  }
}
