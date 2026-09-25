import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";

import { Container } from "@/components/site/layout";
import { Highlight, Reveal } from "@/components/site/motion";
import { PageHero } from "@/components/site/PageHero";
import { Pagination } from "@/components/site/Pagination";
import type { Schema } from "@/lib/api/types";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

import { countLabel, pageParam } from "./_components/agency";
import { AgencyCard, CARD_PHOTOS } from "./_components/AgencyCard";
import { AgencyCta } from "./_components/AgencyCta";
import { AGENCIES_MAX_PAGE_SIZE, AGENCIES_PAGE_SIZE, getAgencies, getAgencyShowcase } from "./_components/data";
import { Notice } from "./_components/Notice";

export const metadata: Metadata = {
  title: "Agences immobilières partenaires",
  description:
    "Les agences immobilières partenaires de Dahoo au Sénégal : consultez leurs coordonnées et tous leurs biens à louer ou à vendre.",
  alternates: { canonical: "/agences" },
};

type Agency = Schema<"PublicAgency">;

/** Clé de comparaison d'une ville (« Saint-Louis » = « saint louis »). */
function cityKey(city: string): string {
  return city
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[\s-]+/g, " ")
    .trim();
}

/** Villes des agences, de la plus représentée à la moins représentée. */
function citiesOf(agencies: Agency[]): { city: string; count: number }[] {
  const byKey = new Map<string, { city: string; count: number }>();
  for (const agency of agencies) {
    if (!agency.city) continue;
    const key = cityKey(agency.city);
    const entry = byKey.get(key);
    if (entry) entry.count += 1;
    else byKey.set(key, { city: agency.city, count: 1 });
  }
  return [...byKey.values()].sort((a, b) => b.count - a.count || a.city.localeCompare(b.city, "fr"));
}

/** Filtre par ville, en liens (fonctionne sans JavaScript, indexable). */
function CityFilter({ cities, total, current }: { cities: { city: string; count: number }[]; total: number; current?: string }) {
  const items = [{ label: "Toutes", count: total, href: "/agences", active: !current }].concat(
    cities.map((item) => ({
      label: item.city,
      count: item.count,
      href: `/agences?ville=${encodeURIComponent(item.city)}`,
      active: current !== undefined && cityKey(item.city) === current,
    })),
  );
  return (
    <nav aria-label="Filtrer les agences par ville">
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium no-underline transition-colors duration-300",
                item.active
                  ? "bg-text-strong text-canvas border-transparent"
                  : "border-border-strong text-text-strong hover:bg-(--ax-fill-hover)",
              )}
            >
              {item.label}
              <span className={cn("font-mono text-xs", item.active ? "text-canvas/70" : "text-text-muted")}>{formatNumber(item.count)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default async function AgenciesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const page = pageParam(query.page);
  const rawCity = Array.isArray(query.ville) ? query.ville[0] : query.ville;
  const city = rawCity?.trim() ? cityKey(rawCity) : undefined;

  // L'API ne filtre pas les agences par ville : on lit tout l'annuaire (une page de 50, le maximum)
  // pour les villes du filtre et, si une ville est choisie, on filtre ici (sans pagination).
  const [directory, paged] = await Promise.all([
    getAgencies(1, AGENCIES_MAX_PAGE_SIZE),
    city ? Promise.resolve(null) : getAgencies(page),
  ]);
  if (paged === "page-not-found") notFound();

  const all = directory && directory !== "page-not-found" ? directory.results : [];
  const cities = citiesOf(all);
  const result = city
    ? directory && directory !== "page-not-found"
      ? { results: all.filter((agency) => agency.city && cityKey(agency.city) === city) }
      : null
    : paged;
  const agencies = result?.results ?? [];
  const pageCount = !city && paged ? Math.max(1, Math.ceil(paged.count / AGENCIES_PAGE_SIZE)) : 1;
  const cityLabel = city ? (cities.find((item) => cityKey(item.city) === city)?.city ?? rawCity) : undefined;

  // Vitrines des agences : un appel par agence, en parallèle, mis en cache 60 s.
  const showcases = await Promise.all(
    agencies.map((agency) => (agency.listings_count > 0 ? getAgencyShowcase(agency.id, CARD_PHOTOS) : Promise.resolve([]))),
  );

  const total = directory && directory !== "page-not-found" ? directory.count : agencies.length;

  return (
    <>
      <PageHero
        className="pb-8 sm:pb-10 lg:pb-12"
        crumbs={[{ label: "Agences" }]}
        eyebrow={total > 0 ? countLabel(total, "agence partenaire", "agences partenaires") : "Agences partenaires"}
        title={
          // Clé : PageHero place le titre dans une liste (RevealLines).
          <Fragment key="titre">
            Des agences de confiance, <Highlight>près de chez vous</Highlight>
          </Fragment>
        }
        lede={<p className="m-0">Chaque annonce du portail est publiée par l&apos;une de ces agences. Voyez leurs biens, puis appelez-les.</p>}
      >
        {cities.length > 1 && <CityFilter cities={cities} total={total} current={city} />}
      </PageHero>

      <section aria-labelledby="liste-agences" className="pb-16 sm:pb-24 lg:pb-28">
        <Container>
          <h2 id="liste-agences" className="sr-only">
            {cityLabel ? `Agences à ${cityLabel}` : "L'annuaire des agences"}
          </h2>

          {result === null ? (
            <Notice
              role="status"
              title={
                <>
                  Liste momentanément <Highlight>indisponible</Highlight>
                </>
              }
            >
              <p className="m-0">
                Nous n&apos;arrivons pas à charger les agences pour le moment. Réessayez dans quelques instants.
              </p>
            </Notice>
          ) : agencies.length === 0 ? (
            <Notice
              title={city ? `Aucune agence à ${cityLabel}` : "Aucune agence pour le moment"}
              action={
                city ? (
                  <Link href="/agences" className="ax-btn ax-btn--secondary ax-btn--lg">
                    <span className="ax-btn__label">Voir toutes les agences</span>
                  </Link>
                ) : undefined
              }
            >
              {!city && <p className="m-0">Les premières agences partenaires publient bientôt leurs biens sur Dahoo.</p>}
            </Notice>
          ) : (
            <>
              <ul className="m-0 grid list-none grid-cols-2 gap-2 p-0 sm:gap-3 lg:grid-cols-3 lg:gap-4">
                {agencies.map((agency, index) => (
                  <Reveal as="li" key={agency.id} delay={(index % 3) * 0.08}>
                    <AgencyCard agency={agency} listings={showcases[index] ?? []} />
                  </Reveal>
                ))}
              </ul>

              {!city && (
                <Pagination
                  page={page}
                  pageCount={pageCount}
                  hrefFor={(target) => (target === 1 ? "/agences" : `/agences?page=${target}`)}
                  label="Pages de la liste des agences"
                />
              )}
            </>
          )}
        </Container>
      </section>

      <AgencyCta />
    </>
  );
}
