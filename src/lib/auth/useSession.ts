"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import { api, getActiveOrganization } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import type { Schema } from "@/lib/api/types";

export const SESSION_KEYS = {
  me: ["session", "me"] as const,
  capabilities: ["session", "capabilities"] as const,
};

export type Me = Schema<"Me">;
export type Membership = Schema<"MeMembership">;

/**
 * Utilisateur connecté, organisation active et capabilities.
 * `can("lease.activate")` sert à afficher ou masquer les actions ; l'API reste seule juge.
 */
export function useSession() {
  const me = useQuery({
    queryKey: SESSION_KEYS.me,
    queryFn: async () => unwrap(await api.GET("/api/v1/users/me/")),
    staleTime: 5 * 60_000,
  });

  const memberships = me.data?.memberships ?? [];
  const activeId = Number(getActiveOrganizationSafe()) || memberships[0]?.organization_id;
  const membership: Membership | undefined =
    memberships.find((m) => m.organization_id === activeId) ?? memberships[0];

  const capabilities = useQuery({
    queryKey: [...SESSION_KEYS.capabilities, membership?.organization_id],
    queryFn: async () => unwrap(await api.GET("/api/v1/users/me/capabilities/")),
    enabled: Boolean(membership),
    staleTime: 5 * 60_000,
  });

  const granted = useMemo(() => new Set(capabilities.data?.capabilities ?? []), [capabilities.data]);
  const can = useCallback((capability: string) => granted.has(capability), [granted]);

  return {
    user: me.data,
    membership,
    memberships,
    isPlatformAdmin: me.data?.is_platform_admin ?? false,
    isReadOnly: membership?.access_status === "EXPIRED",
    can,
    isLoading: me.isLoading || (Boolean(membership) && capabilities.isLoading),
    error: me.error ?? capabilities.error,
  };
}

function getActiveOrganizationSafe(): string | null {
  return typeof window === "undefined" ? null : getActiveOrganization();
}
