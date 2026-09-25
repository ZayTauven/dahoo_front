"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { useSession } from "@/lib/auth/useSession";

/**
 * Analytics de l'agence active (`/api/v1/analytics/dashboard/`), partagées par le tableau de bord et
 * les bandeaux d'indicateurs des écrans métier : une seule requête en cache pour toute l'application.
 */
export function useDashboard(months: 6 | 12 = 12) {
  const { membership } = useSession();
  return useQuery({
    queryKey: ["dashboard", months, membership?.organization_id],
    queryFn: async () => unwrap(await api.GET("/api/v1/analytics/dashboard/", { params: { query: { months } } })),
    enabled: Boolean(membership),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}
