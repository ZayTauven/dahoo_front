import { IconArrowRight, IconX } from "@tabler/icons-react";
import Link from "next/link";

import { Container } from "@/components/site/layout";
import { Highlight, Reveal } from "@/components/site/motion";
import { PageHero } from "@/components/site/PageHero";
import { Pagination } from "@/components/site/Pagination";
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
  listingHeadlineParts,
  pageHref,
  parseFilters,
  searchString,
  withoutFilter,
  type FilterKey,
  type ListingFilters,
  type ListingType,
  type RawSearchParams,
} from "./filters";
import { SortSelect } from "./SortSelect";

type Result =
  | { status: "ok"; count: number; listings: Schema<"PublicListing">[] }
  | { status: "out-of-range" }
  | { status: "error" };

/** Textes d'en-tête propres à chaque liste. */
const INTRO: Record<ListingType, { eyebrow: string; lede: string }> = {
  RENT: {
    eyebrow: "Trouvez votre prochain logement",
    lede: "Appartements, villas, studios et locaux professionnels proposés par des agences immobilières partenaires, de Dakar à la Petite-Côte.",
  },
  SALE: {
    eyebrow: "Investissez en toute confiance",
    lede: "Maisons, appartements et terrains à vendre, présentés par des agences immobilières vérifiées. Prix affichés en FCFA.",
  },
};

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
 * en-tête éditorial, filtres en grille à filets, compteur + tri, grille de cartes, pagination.
 */
export async function ListingsScreen({ listingType, searchParams }: { listingType: ListingType; searchParams: RawSearchParams }) {
  const cities = await loadCities();
  const filters = parseFilters(searchParams, cities);
  const result = await loadListings(listingType, filters);

  const page = LISTING_PAGES[listingType];
  const other = LISTING_PAGES[listingType === "RENT" ? "SALE" : "RENT"];
  const intro = INTRO[listingType];
  const headline = listingHeadlineParts(listingType, filters);
  const chips = activeChips(page.path, filters);
  const filtered = hasActiveFilters(filters);
  const pageCount = result.status === "ok" ? Math.ceil(result.count / PAGE_SIZE) : 0;
  // Remonte les champs quand l'URL change (lien « retirer », réinitialisation) : ils reprennent les valeurs de l'URL.
  const stateKey = searchString(filters);

  return (
    <>
      <PageHero
        crumbs={[{ label: page.crumb }]}
        eyebrow={intro.eyebrow}
        title={
          <>
            {headline.subject} <Highlight>{headline.verb}</Highlight>
            {headline.place}
          </>
        }
        lede={intro.lede}
        className="pb-12 sm:pb-16 lg:pb-20"
      >
        <Link href={other.path} className="site-link text-text-strong inline-flex items-center gap-2 self-start font-medium">
          Voir plutôt les {other.title.toLowerCase()} <IconArrowRight size={18} stroke={1.75} aria-hidden="true" />
        </Link>
      </PageHero>

      <div className="pb-24 sm:pb-32">
        <Container>
          <FilterForm
            key={stateKey}
            path={page.path}
            filters={filters}
            cities={cities}
            categories={CATEGORIES.map((value) => ({ value, label: categoryLabel(value) }))}
            activeCount={chips.length}
            budgetHint={listingType === "RENT" ? "FCFA par mois" : "FCFA"}
          />

          <section aria-labelledby="annonces-resultats" className="mt-14 sm:mt-20">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div aria-live="polite" className="flex flex-col gap-3">
                {result.status === "ok" && result.count > PAGE_SIZE && (
                  <p className="site-label text-text-muted m-0">
                    Page {String(filters.page).padStart(2, "0")} / {String(pageCount).padStart(2, "0")}
                  </p>
                )}
                <h2
                  id="annonces-resultats"
                  className="font-display text-text-strong m-0 text-[2.6rem] leading-none tracking-tight sm:text-5xl lg:text-6xl"
                >
                  {result.status === "ok" ? resultsLabel(result.count) : "Résultats"}
                </h2>
              </div>
              <SortSelect key={stateKey} value={filters.ordering} />
            </div>

            {chips.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
                <p className="site-label text-text-muted m-0">Filtres actifs</p>
                <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                  {chips.map((chip) => (
                    <li key={chip.key}>
                      <Link
                        href={chip.href}
                        scroll={false}
                        aria-label={`Retirer le filtre ${chip.label}`}
                        className="border-border-strong text-text-strong hover:bg-text-strong hover:text-canvas inline-flex min-h-9 items-center gap-2 rounded-full border py-1 pr-3 pl-4 text-sm no-underline transition-colors duration-300"
                      >
                        {chip.label}
                        <IconX size={14} stroke={1.75} aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href={page.path} scroll={false} className="site-link text-text-strong text-sm font-medium">
                  Tout effacer
                </Link>
              </div>
            )}

            <div className="border-border-default mt-10 border-t pt-12 sm:pt-16">
              {result.status === "error" && (
                <Notice
                  role="alert"
                  label="Service indisponible"
                  title="Les annonces sont momentanément indisponibles"
                  text="Nous n'arrivons pas à charger les biens pour le moment. Réessayez dans quelques instants."
                  primary={{ label: "Réessayer", href: `${page.path}${stateKey}` }}
                />
              )}

              {result.status === "out-of-range" && (
                <Notice
                  label="Page introuvable"
                  title="Cette page n'existe pas"
                  text="Le nombre d'annonces a changé depuis votre dernière visite. Revenez à la première page des résultats."
                  primary={{ label: "Première page", href: pageHref(page.path, filters, 1) }}
                />
              )}

              {result.status === "ok" && result.count === 0 && (
                <Notice
                  label={filtered ? "Aucun résultat" : "Bientôt en ligne"}
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
                  {/* Colonne du milieu décalée vers le bas (bureau) : rythme de magazine, rangées lisibles. */}
                  <ul className="m-0 grid list-none gap-x-8 gap-y-16 p-0 sm:grid-cols-2 sm:gap-y-20 lg:grid-cols-3 lg:[&>li:nth-child(3n+2)]:mt-24">
                    {result.listings.map((listing, index) => (
                      <Reveal as="li" key={listing.id} delay={(index % 3) * 0.08}>
                        <PropertyCard listing={listing} preload={index < 3} />
                      </Reveal>
                    ))}
                  </ul>
                  <Pagination page={filters.page} pageCount={pageCount} hrefFor={(target) => pageHref(page.path, filters, target)} />
                </>
              )}
            </div>
          </section>
        </Container>
      </div>
    </>
  );
}

/** État vide ou erreur, en typographie : étiquette, grand titre serif, texte et actions. */
function Notice({
  role,
  label,
  title,
  text,
  primary,
  secondary,
}: {
  role?: "alert";
  label: string;
  title: string;
  text: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <div role={role} className="grid gap-8 lg:grid-cols-12 lg:gap-8">
      <p className="site-label text-accent-text m-0 lg:col-span-3 lg:pt-3">{label}</p>
      <div className="flex flex-col items-start gap-6 lg:col-span-8">
        <h3 className="font-display text-text-strong m-0 max-w-3xl text-4xl leading-[1.02] font-normal tracking-tight text-balance sm:text-5xl lg:text-6xl">
          {title}
        </h3>
        <p className="text-text-muted m-0 max-w-xl text-base leading-relaxed sm:text-lg">{text}</p>
        {(primary || secondary) && (
          <div className="mt-2 flex flex-wrap items-center gap-x-8 gap-y-4">
            {primary && (
              <Link href={primary.href} className="ax-btn ax-btn--primary ax-btn--lg">
                <span className="ax-btn__label">{primary.label}</span>
              </Link>
            )}
            {secondary && (
              <Link href={secondary.href} className="site-link text-text-strong inline-flex items-center gap-2 font-medium">
                {secondary.label} <IconArrowRight size={18} stroke={1.75} aria-hidden="true" />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
