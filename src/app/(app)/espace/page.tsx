"use client";

import { IconBuildingEstate, IconFileText, IconTool, IconUsers } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";

import { KpiCard } from "@/components/app/KpiCard";
import { PageHead } from "@/components/app/shell/PageHead";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { useSession } from "@/lib/auth/useSession";

function greeting(): string {
  const hour = new Date().getHours();
  return hour < 18 ? "Bonjour" : "Bonsoir";
}

export default function DashboardPage() {
  const { user, membership, can } = useSession();

  // Chaque liste paginée renvoie `count` : suffisant pour les indicateurs de premier niveau.
  const properties = useQuery({
    queryKey: ["dashboard", "properties"],
    queryFn: async () => unwrap(await api.GET("/api/v1/properties/properties/")).count,
    enabled: can("property.view"),
  });
  const tenants = useQuery({
    queryKey: ["dashboard", "tenants"],
    queryFn: async () => unwrap(await api.GET("/api/v1/leases/tenants/")).count,
    enabled: can("tenant.view"),
  });
  const leases = useQuery({
    queryKey: ["dashboard", "leases"],
    queryFn: async () => unwrap(await api.GET("/api/v1/leases/")).count,
    enabled: can("lease.view"),
  });
  const tickets = useQuery({
    queryKey: ["dashboard", "tickets"],
    queryFn: async () => unwrap(await api.GET("/api/v1/maintenance/tickets/")).count,
    enabled: can("maintenance.ticket.view"),
  });

  return (
    <>
      <PageHead
        title={`${greeting()}${user ? `, ${user.first_name}` : ""}`}
        subtitle={membership ? `Voici l'activité de ${membership.organization_name}.` : undefined}
      />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {can("property.view") && (
          <KpiCard label="Biens" value={properties.data} loading={properties.isLoading} icon={IconBuildingEstate} href="/espace/biens" tone={1} />
        )}
        {can("tenant.view") && (
          <KpiCard label="Locataires" value={tenants.data} loading={tenants.isLoading} icon={IconUsers} href="/espace/locataires" tone={2} />
        )}
        {can("lease.view") && (
          <KpiCard label="Baux" value={leases.data} loading={leases.isLoading} icon={IconFileText} href="/espace/baux" tone={3} />
        )}
        {can("maintenance.ticket.view") && (
          <KpiCard label="Tickets de maintenance" value={tickets.data} loading={tickets.isLoading} icon={IconTool} href="/espace/maintenance" tone={4} />
        )}
      </div>
    </>
  );
}
