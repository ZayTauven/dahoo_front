"use client";

import { IconMail, IconMessageCircle, IconPhone } from "@tabler/icons-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Pagination } from "@/components/app/ui/DataTable";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { formatDate, formatNumber } from "@/lib/format";

import { KEYS, type Listing } from "./data";

const time = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });

const SOURCES: Record<string, string> = {
  site: "Portail Dahoo",
  whatsapp: "WhatsApp",
  facebook: "Facebook",
  agent: "Agent",
};

/** Demandes de visite reçues pour une annonce (droit listing.interest.view). */
export function InterestsSection({ listing }: { listing: Listing }) {
  const [page, setPage] = useState(1);
  const interests = useQuery({
    queryKey: KEYS.interests(listing.id, page),
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/listings/{id}/interests/", {
          params: { path: { id: listing.id }, query: page > 1 ? { page } : undefined },
        }),
      ),
    placeholderData: keepPreviousData,
  });
  const count = interests.data?.count;

  return (
    <section className="ax-card" aria-labelledby="annonce-demandes">
      <div className="ax-card__header flex flex-wrap items-center justify-between gap-2">
        <div className="ax-card__titles">
          <h2 className="ax-card__title" id="annonce-demandes">
            Demandes de visite
          </h2>
          <p className="ax-card__subtitle">Envoyées par les visiteurs du portail depuis la page de l&apos;annonce.</p>
        </div>
        {count !== undefined && count > 0 && (
          <span className="ax-badge ax-badge--soft ax-badge--accent ax-num">
            {formatNumber(count)} demande{count > 1 ? "s" : ""}
          </span>
        )}
      </div>
      <div className="ax-card__body flex flex-col gap-4">
        {interests.error ? (
          <div className="ax-alert ax-alert--danger" role="alert">
            <div className="ax-alert__content">
              <p className="ax-alert__message">{interests.error.message}</p>
            </div>
            <div className="ax-alert__actions">
              <button type="button" className="ax-btn ax-btn--sm ax-btn--ghost" onClick={() => interests.refetch()}>
                <span className="ax-btn__label">Réessayer</span>
              </button>
            </div>
          </div>
        ) : interests.isLoading ? (
          <div className="flex flex-col gap-3" aria-busy="true" aria-label="Chargement des demandes">
            {Array.from({ length: 2 }, (_, index) => (
              <div key={index} className="flex flex-col gap-2">
                <span className="ax-skeleton ax-skeleton--text" style={{ inlineSize: "40%" }} />
                <span className="ax-skeleton ax-skeleton--text" style={{ inlineSize: "75%" }} />
              </div>
            ))}
          </div>
        ) : count === 0 ? (
          <div className="bg-surface-subtle text-text-muted flex flex-col items-center gap-2 rounded-md px-4 py-8 text-center">
            <IconMessageCircle size={32} stroke={1.5} aria-hidden="true" className="text-text-subtle" />
            <p className="text-text-strong m-0 font-medium">Aucune demande pour l&apos;instant</p>
            <p className="m-0 max-w-md text-sm">
              {listing.status === "PUBLISHED"
                ? "Les demandes envoyées depuis le portail s'afficheront ici, avec les coordonnées du prospect."
                : "Publiez l'annonce pour recevoir des demandes de visite depuis le portail."}
            </p>
          </div>
        ) : (
          <ul className="m-0 flex list-none flex-col p-0" aria-busy={interests.isFetching}>
            {interests.data?.results.map((interest) => {
              const created = new Date(interest.created_at);
              const source = SOURCES[interest.prospect.source] ?? interest.prospect.source;
              return (
                <li key={interest.id} className="border-border-default flex flex-col gap-2 border-b py-4 first:pt-0 last:border-b-0 last:pb-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <span className="text-text-strong font-semibold">{interest.prospect.full_name}</span>
                    <span className="text-text-subtle text-xs">
                      <time dateTime={interest.created_at}>
                        {formatDate(interest.created_at)} à {Number.isNaN(created.getTime()) ? "—" : time.format(created)}
                      </time>
                      {source && ` · ${source}`}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    <a href={`tel:${interest.prospect.phone.replace(/\s/g, "")}`} className="text-link ax-num inline-flex items-center gap-1.5">
                      <IconPhone size={16} stroke={1.75} aria-hidden="true" />
                      {interest.prospect.phone}
                    </a>
                    {interest.prospect.email && (
                      <a href={`mailto:${interest.prospect.email}`} className="text-link inline-flex min-w-0 items-center gap-1.5 break-all">
                        <IconMail size={16} stroke={1.75} aria-hidden="true" className="shrink-0" />
                        {interest.prospect.email}
                      </a>
                    )}
                  </div>
                  {interest.message ? (
                    <p className="bg-surface-subtle text-text m-0 rounded-md px-3 py-2 text-sm whitespace-pre-line">{interest.message}</p>
                  ) : (
                    <p className="text-text-subtle m-0 text-sm italic">Pas de message.</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {count !== undefined && <Pagination count={count} page={page} onPageChange={setPage} />}
      </div>
    </section>
  );
}
