import { IconAlertTriangle, IconHomeSearch, IconX } from "@tabler/icons-react";
import Link from "next/link";

import { Container } from "@/components/site/layout";
import { PropertyCard } from "@/components/site/PropertyCard";
import { publicApi } from "@/lib/api/server";
import type { Schema } from "@/lib/api/types";
import { formatMoney, formatNumber } from "@/lib/format";

import { loadCities } from "./data";
import { FilterForm } from "./FilterForm";
import {
  CATEGORIES,
  LISTING_PAGES,
  PAGE_SIZE,
  apiQuery,
  categoryLabel,
  hasActiveFilters,
  listingHeadline,
  pageHref,
  parseFilters,
  searchString,
  withoutFilter,
  type FilterKey,
  type ListingFilters,
  type ListingType,
  type RawSearchParams,
} from "./filters";
import { ListingsBanner } from "./ListingsBanner";
import { Pagination } from "./Pagination";
import { SortSelect } from "./SortSelect";

type Result =
  | { status: "ok"; count: number; listings: Schema<"PublicListing">[] }
  | { status: "out-of-range" }
  | { status: "error" };

async function loadListings(listingType: ListingType, filters: ListingFilters): Promise<Result> {
  try {
    const { data, response } = await publicApi.GET("/api/v1/public/listings/", {
      params: { query: apiQuery(listingType, filters) },
    });
    if (data) return { status: "ok", count: data.count, listings: data.results };
    // Django répond 404 « Page non valide » au-delà de la dernière page.
    if (response.status === 404 && filters.page > 1) return { status: "out-of-range" };
    return { status: "error" };
  } catch {
    return { status: "error" };
  }
}

/** Filtres actifs, chacun avec le lien qui le retire. */
function activeChips(path: string, filters: ListingFilters): { key: FilterKey; label: string; href: string }[] {
  const chips: { key: FilterKey; label: string }[] = [];
  if (filters.q) chips.push({ key: "q", label: `« ${filters.q} »` });
  if (filters.city) chips.push({ key: "city", label: filters.city });
  if (filters.category) chips.push({ key: "category", label: categoryLabel(filters.category) });
  if (filters.min_price !== undefined) chips.push({ key: "min_price", label: `Dès ${formatMoney(filters.min_price)}` });
  if (filters.max_price !== undefined) chips.push({ key: "max_price", label: `Jusqu'à ${formatMoney(filters.max_price)}` });
  if (filters.min_bedrooms !== undefined) {
    chips.push({
      key: "min_bedrooms",
      label: `${filters.min_bedrooms} ${filters.min_bedrooms > 1 ? "chambres" : "chambre"} ou plus`,
    });
  }
  return chips.map((chip) => ({ ...chip, href: withoutFilter(path, filters, chip.key) }));
}

function resultsLabel(count: number): string {
  if (count === 0) return "Aucun bien trouvé";
  return `${formatNumber(count)} ${count > 1 ? "biens trouvés" : "bien trouvé"}`;
}

/**
 * Écran commun des listes d'annonces /louer et /acheter (Server Component) :
 * bandeau de titre, panneau de filtres chevauchant le bandeau, compteur + tri, grille, pagination.
 */
export async function ListingsScreen({ listingType, searchParams }: { listingType: ListingType; searchParams: RawSearchParams }) {
  const cities = await loadCities();
  const filters = parseFilters(searchParams, cities);
  const result = await loadListings(listingType, filters);

  const page = LISTING_PAGES[listingType];
  const other = LISTING_PAGES[listingType === "RENT" ? "SALE" : "RENT"];
  const chips = activeChips(page.path, filters);
  const filtered = hasActiveFilters(filters);
  // Remonte les champs quand l'URL change (lien « retirer », réinitialisation) : ils reprennent les valeurs de l'URL.
  const stateKey = searchString(filters);

  return (
    <>
      <ListingsBanner listingType={listingType} heading={listingHeadline(listingType, filters)} />

      <div className="bg-surface-subtle pb-20 sm:pb-24">
        <Container className="relative -mt-14 sm:-mt-16">
          <FilterForm
            key={stateKey}
            path={page.path}
            filters={filters}
            cities={cities}
            categories={CATEGORIES.map((value) => ({ value, label: categoryLabel(value) }))}
            activeCount={chips.length}
            budgetHint={listingType === "RENT" ? "FCFA par mois" : "FCFA"}
          />

          <section aria-labelledby="annonces-resultats" className="mt-10 sm:mt-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div aria-live="polite" className="flex flex-col gap-1">
                <h2 id="annonces-resultats" className="font-display text-text-strong m-0 text-2xl font-semibold tracking-tight sm:text-3xl">
                  {result.status === "ok" ? resultsLabel(result.count) : "Résultats"}
                </h2>
                {result.status === "ok" && result.count > PAGE_SIZE && (
                  <p className="text-text-muted m-0 text-sm">
                    Page {filters.page} sur {Math.ceil(result.count / PAGE_SIZE)}
                  </p>
                )}
              </div>
              <SortSelect key={stateKey} value={filters.ordering} />
            </div>

            {chips.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <p className="text-text-muted m-0 mr-1 text-sm">Filtres actifs :</p>
                <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                  {chips.map((chip) => (
                    <li key={chip.key}>
                      <Link
                        href={chip.href}
                        scroll={false}
                        aria-label={`Retirer le filtre ${chip.label}`}
                        className="border-border-default text-text-strong hover:border-brand hover:text-brand inline-flex min-h-9 items-center gap-1.5 rounded-full border bg-(--ax-surface-solid) py-1 pr-2.5 pl-3.5 text-sm font-medium no-underline transition-colors"
                      >
                        {chip.label}
                        <IconX size={14} stroke={2.25} aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href={page.path} scroll={false} className="text-link ml-1 text-sm font-semibold underline-offset-4 hover:underline">
                  Tout effacer
                </Link>
              </div>
            )}

            <div className="mt-8">
              {result.status === "error" && (
                <div role="alert" className="ax-alert ax-alert--danger">
                  <IconAlertTriangle className="ax-alert__icon" stroke={1.75} aria-hidden="true" />
                  <div className="ax-alert__content">
                    <p className="ax-alert__title">Les annonces sont momentanément indisponibles</p>
                    <p className="ax-alert__message">
                      Nous n&apos;arrivons pas à charger les biens pour le moment. Réessayez dans quelques instants.
                    </p>
                    <div className="ax-alert__actions">
                      <Link href={`${page.path}${stateKey}`} className="ax-btn ax-btn--secondary ax-btn--sm">
                        <span className="ax-btn__label">Réessayer</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {result.status === "out-of-range" && (
                <EmptyResults
                  title="Cette page n'existe pas"
                  text="Le nombre d'annonces a changé depuis votre dernière visite. Revenez à la première page des résultats."
                  primary={{ label: "Première page", href: pageHref(page.path, filters, 1) }}
                />
              )}

              {result.status === "ok" && result.count === 0 && (
                <EmptyResults
                  title={filtered ? "Aucun bien ne correspond à votre recherche" : `Aucun bien ${page.verb} pour le moment`}
                  text={
                    filtered
                      ? "Élargissez votre budget, choisissez une autre ville ou retirez quelques filtres : de nouvelles annonces sont publiées chaque semaine."
                      : "Les agences partenaires publient régulièrement de nouveaux biens. Revenez bientôt."
                  }
                  primary={filtered ? { label: "Réinitialiser les filtres", href: page.path } : undefined}
                  secondary={{ label: `Voir les ${other.title.toLowerCase()}`, href: other.path }}
                />
              )}

              {result.status === "ok" && result.listings.length > 0 && (
                <>
                  <ul className="m-0 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                    {result.listings.map((listing) => (
                      <li key={listing.id}>
                        <PropertyCard listing={listing} />
                      </li>
                    ))}
                  </ul>
                  <Pagination
                    page={filters.page}
                    pageCount={Math.ceil(result.count / PAGE_SIZE)}
                    hrefFor={(target) => pageHref(page.path, filters, target)}
                  />
                </>
              )}
            </div>
          </section>
        </Container>
      </div>
    </>
  );
}

function EmptyResults({
  title,
  text,
  primary,
  secondary,
}: {
  title: string;
  text: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <div className="border-border-default flex flex-col items-center gap-4 rounded-2xl border border-dashed bg-(--ax-surface-solid) px-6 py-14 text-center sm:py-20">
      <span className="bg-accent-wash text-brand flex size-16 items-center justify-center rounded-full">
        <IconHomeSearch size={30} stroke={1.5} aria-hidden="true" />
      </span>
      <h3 className="font-display text-text-strong m-0 max-w-md text-xl font-semibold sm:text-2xl">{title}</h3>
      <p className="text-text-muted m-0 max-w-md text-base leading-relaxed">{text}</p>
      {(primary || secondary) && (
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          {primary && (
            <Link href={primary.href} className="ax-btn ax-btn--primary ax-btn--lg">
              <span className="ax-btn__label">{primary.label}</span>
            </Link>
          )}
          {secondary && (
            <Link href={secondary.href} className="ax-btn ax-btn--secondary ax-btn--lg">
              <span className="ax-btn__label">{secondary.label}</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
