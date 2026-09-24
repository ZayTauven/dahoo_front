"use client";

import { IconUsersGroup } from "@tabler/icons-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { EmptyState } from "@/components/app/EmptyState";
import { DataTable, type Column } from "@/components/app/ui/DataTable";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { formatDate } from "@/lib/format";

import { KEYS, ROLE_LABELS, type Member } from "./data";

/** Membres d'une agence, en lecture seule (l'administrateur de l'agence gère son équipe). */
export function MembersCard({ organizationId }: { organizationId: number }) {
  const [page, setPage] = useState(1);
  const members = useQuery({
    queryKey: [...KEYS.members, organizationId, page],
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/platform/organizations/{id}/members/", {
          params: { path: { id: organizationId }, query: page > 1 ? { page } : undefined },
        }),
      ),
    placeholderData: keepPreviousData,
  });

  const columns: Column<Member>[] = [
    {
      key: "name",
      header: "Membre",
      cell: (member) => (
        <div className="flex flex-col">
          <span className="text-text-strong font-medium">
            {member.user.first_name} {member.user.last_name}
          </span>
          <a href={`tel:${member.user.phone}`} className="ax-num text-link text-xs">
            {member.user.phone}
          </a>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      hideOnMobile: true,
      cell: (member) =>
        member.user.email ? (
          <a href={`mailto:${member.user.email}`} className="text-link break-all">
            {member.user.email}
          </a>
        ) : (
          <span className="text-text-subtle">—</span>
        ),
    },
    { key: "role", header: "Rôle", cell: (member) => ROLE_LABELS[member.role] ?? member.role },
    {
      key: "status",
      header: "Statut",
      cell: (member) =>
        member.is_active === false ? (
          <span className="ax-badge ax-badge--soft ax-badge--neutral">Désactivé</span>
        ) : (
          <span className="ax-badge ax-badge--soft ax-badge--success">Actif</span>
        ),
    },
    { key: "since", header: "Depuis le", hideOnMobile: true, cell: (member) => formatDate(member.created_at, "short") },
  ];

  return (
    <section className="ax-card" aria-labelledby="carte-membres">
      <div className="ax-card__header">
        <div className="ax-card__titles">
          <h2 id="carte-membres" className="ax-card__title">
            Membres
          </h2>
          <p className="ax-card__subtitle">Lecture seule : l&apos;administrateur de l&apos;agence gère son équipe depuis son espace.</p>
        </div>
      </div>
      <div className="ax-card__body">
        <DataTable
          caption="Membres de l'agence"
          columns={columns}
          rows={members.data?.results}
          rowKey={(member) => member.id}
          loading={members.isLoading}
          error={members.error}
          onRetry={() => members.refetch()}
          count={members.data?.count}
          page={page}
          onPageChange={setPage}
          empty={
            <EmptyState icon={IconUsersGroup} title="Aucun membre">
              Cette agence n&apos;a encore aucun membre.
            </EmptyState>
          }
        />
      </div>
    </section>
  );
}
