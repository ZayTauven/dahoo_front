import { IconHomeSearch, IconMail, IconMapPin, IconPhone } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container, Section } from "@/components/site/layout";
import { Highlight, Reveal } from "@/components/site/motion";
import { PropertyCard } from "@/components/site/PropertyCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

import { countLabel, formatPhone, pageParam, telHref } from "../_components/agency";
import { AgencyCta } from "../_components/AgencyCta";
import { AgencyMonogram } from "../_components/AgencyMonogram";
import { getAgency, getAgencyListings, LISTINGS_PAGE_SIZE, type ListingTypeFilter } from "../_components/data";
import { PageBanner } from "../_components/PageBanner";
import { Pagination } from "../_components/Pagination";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Identifiant d'agence lu dans l'URL : entier strictement positif, sinon page introuvable. */
function agencyId(raw: string): number {
  const id = Number(raw);
  if (!/^\d+$/.test(raw) || !Number.isSafeInteger(id) || id <= 0) notFound();
  return id;
}

function typeParam(value: string | string[] | undefined): ListingTypeFilter | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "RENT" || raw === "SALE" ? raw : undefined;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const agency = /^\d+$/.test(id) ? await getAgency(Number(id)) : "not-found";
  if (agency === "not-found") return { title: "Agence introuvable", robots: { index: false } };
  if (agency === null) return { title: "Agence immobilière" };

  const where = agency.city ? ` à ${agency.city}` : "";
  return {
    title: `${agency.name}${where}`,
    description: `${agency.name}, agence immobilière partenaire de Dahoo${where} : ${countLabel(agency.listings_count, "annonce publiée", "annonces publiées")}, coordonnées et biens à louer ou à vendre.`,
    alternates: { canonical: `/agences/${agency.id}` },
  };
}

const FILTERS: { value: ListingTypeFilter | undefined; label: string }[] = [
  { value: undefined, label: "Toutes" },
  { value: "RENT", label: "À louer" },
  { value: "SALE", label: "À vendre" },
];

export default async function AgencyPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const id = agencyId((await params).id);
  const query = await searchParams;
  const page = pageParam(query.page);
  const listingType = typeParam(query.type);

  const agency = await getAgency(id);
  if (agency === "not-found") notFound();
  if (agency === null) throw new Error("API publique indisponible : fiche d'agence non chargée.");

  const listings = await getAgencyListings(id, page, listingType);
  const pageCount = listings && listings !== "page-not-found" ? Math.max(1, Math.ceil(listings.count / LISTINGS_PAGE_SIZE)) : 1;

  const hrefFor = (target: number, type: ListingTypeFilter | undefined = listingType) => {
    const search = new URLSearchParams();
    if (type) search.set("type", type);
    if (target > 1) search.set("page", String(target));
    const qs = search.toString();
    return `/agences/${id}${qs ? `?${qs}` : ""}#annonces`;
  };

  const counts = [
    { label: "Biens à louer", value: agency.listings_by_type.RENT },
    { label: "Biens à vendre", value: agency.listings_by_type.SALE },
    { label: "Annonces publiées", value: agency.listings_count },
  ];

  return (
    <>
      <PageBanner
        eyebrow={agency.city ? `Agence immobilière · ${agency.city}` : "Agence immobilière"}
        title={agency.name}
        crumbs={[{ label: "Agences", href: "/agences" }, { label: agency.name }]}
        image="/images/site/slider-03.webp"
      />

      <Section tone="subtle" labelledBy="coordonnees">
        <Container className="grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
          <Reveal className="border-border-default relative flex aspect-[495/420] w-full items-center justify-center overflow-hidden rounded-2xl border bg-[var(--ax-surface-solid)] shadow-card">
            <span aria-hidden="true" className="bg-accent-wash absolute -top-16 -left-16 size-56 rounded-full" />
            <span aria-hidden="true" className="bg-brand-600/10 absolute -right-12 -bottom-20 size-64 rounded-full" />
            <AgencyMonogram id={agency.id} name={agency.name} className="relative size-36 text-5xl shadow-lg sm:size-44 sm:text-6xl" />
            <span className="bg-accent text-on-accent absolute top-5 right-5 rounded-full px-3 py-1.5 text-xs font-bold">
              Agence partenaire Dahoo
            </span>
          </Reveal>

          <Reveal delay={0.1} className="flex flex-col gap-6">
            <SectionHeading
              id="coordonnees"
              title={
                <>
                  Contacter <Highlight>l&apos;agence</Highlight>
                </>
              }
            >
              <p className="m-0">
                {agency.name} publie ses biens sur Dahoo. Pour une visite ou une question sur un bien, contactez
                l&apos;agence directement ou faites votre demande depuis l&apos;annonce qui vous intéresse.
              </p>
            </SectionHeading>

            <dl className="m-0 grid grid-cols-3 gap-3">
              {counts.map((item) => (
                <div key={item.label} className="border-border-default flex flex-col gap-1 rounded-xl border bg-[var(--ax-surface-solid)] p-4">
                  <dt className="text-text-muted order-2 text-xs leading-snug font-medium sm:text-sm">{item.label}</dt>
                  <dd className="font-display text-text-strong order-1 m-0 text-2xl font-bold sm:text-3xl">{formatNumber(item.value)}</dd>
                </div>
              ))}
            </dl>

            <ul className="border-border-default m-0 flex list-none flex-col gap-4 border-t p-0 pt-6">
              {(agency.address || agency.city) && (
                <li className="flex items-start gap-3">
                  <span className="bg-surface text-brand border-border-default inline-flex size-10 shrink-0 items-center justify-center rounded-full border">
                    <IconMapPin size={18} stroke={1.75} aria-hidden="true" />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-text-muted text-xs font-semibold tracking-wide uppercase">{agency.address ? "Adresse" : "Ville"}</span>
                    <span className="text-text-strong">{[agency.address, agency.city].filter(Boolean).join(", ")}</span>
                  </span>
                </li>
              )}
              {agency.phone && (
                <li className="flex items-start gap-3">
                  <span className="bg-surface text-brand border-border-default inline-flex size-10 shrink-0 items-center justify-center rounded-full border">
                    <IconPhone size={18} stroke={1.75} aria-hidden="true" />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-text-muted text-xs font-semibold tracking-wide uppercase">Téléphone</span>
                    <a href={telHref(agency.phone)} className="text-link font-semibold">
                      {formatPhone(agency.phone)}
                    </a>
                  </span>
                </li>
              )}
              {agency.email && (
                <li className="flex items-start gap-3">
                  <span className="bg-surface text-brand border-border-default inline-flex size-10 shrink-0 items-center justify-center rounded-full border">
                    <IconMail size={18} stroke={1.75} aria-hidden="true" />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-text-muted text-xs font-semibold tracking-wide uppercase">E-mail</span>
                    <a href={`mailto:${agency.email}`} className="text-link font-semibold break-all">
                      {agency.email}
                    </a>
                  </span>
                </li>
              )}
            </ul>

            <div className="flex flex-col gap-3 sm:flex-row">
              {agency.phone && (
                <a href={telHref(agency.phone)} className="ax-btn ax-btn--primary ax-btn--lg">
                  <IconPhone className="ax-btn__icon" stroke={2} aria-hidden="true" />
                  <span className="ax-btn__label">Appeler l&apos;agence</span>
                </a>
              )}
              <Link href="#annonces" className="ax-btn ax-btn--secondary ax-btn--lg">
                <IconHomeSearch className="ax-btn__icon" stroke={2} aria-hidden="true" />
                <span className="ax-btn__label">Voir ses biens</span>
              </Link>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section id="annonces" labelledBy="annonces-titre" className="scroll-mt-20">
        <Container>
          <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              id="annonces-titre"
              eyebrow={countLabel(agency.listings_count, "annonce publiée", "annonces publiées")}
              title={
                <>
                  Les biens de <Highlight>{agency.name}</Highlight>
                </>
              }
            />
            <nav aria-label="Filtrer les annonces de l'agence">
              <ul className="bg-surface-subtle border-border-default m-0 inline-flex list-none gap-1 rounded-full border p-1">
                {FILTERS.map((filter) => {
                  const active = filter.value === listingType;
                  return (
                    <li key={filter.label}>
                      <Link
                        href={hrefFor(1, filter.value)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold no-underline transition-colors",
                          active ? "bg-brand-600 text-white" : "text-text hover:text-brand",
                        )}
                      >
                        {filter.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </Reveal>

          {listings === null ? (
            <div role="status" className="ax-alert ax-alert--warning mt-10">
              <div className="ax-alert__content">
                <p className="ax-alert__title">Annonces momentanément indisponibles</p>
                <p className="ax-alert__message">Nous n&apos;arrivons pas à charger les biens de cette agence. Réessayez dans quelques instants.</p>
              </div>
            </div>
          ) : listings === "page-not-found" || listings.results.length === 0 ? (
            <div className="ax-empty mt-6">
              <IconHomeSearch className="ax-empty__icon" stroke={1.5} aria-hidden="true" />
              <p className="ax-empty__title">
                {listings === "page-not-found" ? "Cette page n'existe pas" : "Aucun bien dans cette catégorie"}
              </p>
              <Link href={hrefFor(1, undefined)} className="ax-btn ax-btn--secondary">
                <span className="ax-btn__label">Voir toutes les annonces de l&apos;agence</span>
              </Link>
            </div>
          ) : (
            <>
              <ul className="m-0 mt-10 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
                {listings.results.map((listing, index) => (
                  <Reveal as="li" key={listing.id} delay={Math.min(index, 5) * 0.06}>
                    <PropertyCard listing={listing} />
                  </Reveal>
                ))}
              </ul>
              <Pagination page={page} pageCount={pageCount} hrefFor={(target) => hrefFor(target)} label="Pages des annonces de l'agence" />
            </>
          )}
        </Container>
      </Section>

      <AgencyCta />
    </>
  );
}
