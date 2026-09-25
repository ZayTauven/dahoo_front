"use client";

import { IconDoor, IconFlame, IconHomeSearch, IconWorldUpload } from "@tabler/icons-react";

import { StatStrip } from "@/components/app/analytics/StatStrip";
import { useDashboard } from "@/components/app/analytics/useDashboard";
import { Sparkline } from "@/components/app/analytics/visuals";
import { useSession } from "@/lib/auth/useSession";
import { formatNumber } from "@/lib/format";

/** Indicateurs du portail en tête de l'écran Annonces (analytics de l'agence). */
export function ListingsStats() {
  const { can } = useSession();
  const dashboard = useDashboard();
  const listings = dashboard.data?.listings;
  if (!can("analytics.kpi.view") || (dashboard.data && !listings)) return null;

  const top = listings?.top_listings.find((listing) => listing.interests > 0);
  const free = dashboard.data?.portfolio?.units_by_status.FREE ?? 0;

  return (
    <StatStrip
      className="mb-6"
      loading={!listings}
      stats={[
        {
          label: "En ligne sur le portail",
          value: formatNumber(listings?.published ?? 0),
          hint: listings ? `${formatNumber(listings.drafts)} brouillon${listings.drafts > 1 ? "s" : ""}` : undefined,
          icon: IconWorldUpload,
          tone: 1,
        },
        {
          label: "Demandes de visite (30 j)",
          value: formatNumber(listings?.interests_30d ?? 0),
          hint: listings ? `${formatNumber(listings.interests_period)} sur 12 mois` : undefined,
          icon: IconHomeSearch,
          tone: 2,
          visual: listings ? (
            <Sparkline data={listings.monthly_interests.map((m) => m.count)} color="--ax-accent" label="Demandes de visite des derniers mois" width={64} />
          ) : undefined,
        },
        {
          label: "La plus demandée",
          value: top?.title ?? "—",
          hint: top ? `${formatNumber(top.interests)} demande${top.interests > 1 ? "s" : ""}` : "Aucune demande pour l'instant",
          icon: IconFlame,
          tone: 3,
        },
        {
          label: "Lots libres",
          value: formatNumber(free),
          hint: free ? "à publier ou à relouer" : "Tout le parc est occupé",
          icon: IconDoor,
          tone: 4,
        },
      ]}
    />
  );
}
