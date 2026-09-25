import { IconArrowDown, IconPhone } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container, Section } from "@/components/site/layout";
import { Highlight, Reveal, RevealLines } from "@/components/site/motion";
import { Breadcrumbs } from "@/components/site/PageHero";
import { Pagination } from "@/components/site/Pagination";
import { PropertyCard } from "@/components/site/PropertyCard";
import { Eyebrow, SectionHeading } from "@/components/site/SectionHeading";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

import { countLabel, formatPhone, pageParam, telHref } from "../_components/agency";
import { AgencyCta } from "../_components/AgencyCta";
import { AgencyGallery, GALLERY_PHOTOS } from "../_components/AgencyGallery";
import { AgencyMark } from "../_components/AgencyMonogram";
import {
  getAgency,
  getAgencyListings,
  getAgencyShowcase,
  LISTINGS_PAGE_SIZE,
  type ListingTypeFilter,
} from "../_components/data";
import { Notice } from "../_components/Notice";

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

  const [listings, showcase] = await Promise.all([
    getAgencyListings(id, page, listingType),
    getAgencyShowcase(id, GALLERY_PHOTOS),
  ]);
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

  const place = [agency.address, agency.city].filter(Boolean).join(", ");
  const contacts: { label: string; value: string; href?: string }[] = [
    ...(place ? [{ label: agency.address ? "Adresse" : "Ville", value: place }] : []),
    ...(agency.phone ? [{ label: "Téléphone", value: formatPhone(agency.phone), href: telHref(agency.phone) }] : []),
    ...(agency.email ? [{ label: "E-mail", value: agency.email, href: `mailto:${agency.email}` }] : []),
  ];

  return (
    <>
      <div className="pt-8 pb-12 sm:pt-10 sm:pb-16">
        <Container>
          <Breadcrumbs crumbs={[{ label: "Agences", href: "/agences" }, { label: agency.name }]} />

          {/* En-tête : logo (ou monogramme), nom et compteurs réels, puis la mosaïque de ses biens. */}
          <div className="mt-8 grid gap-6 sm:mt-10 lg:grid-cols-12 lg:items-end lg:gap-8">
            <div className="flex items-center gap-5 sm:gap-7 lg:col-span-8">
              <AgencyMark
                name={agency.name}
                logo={agency.logo}
                sizes="112px"
                className="size-18 text-[1.9rem] sm:size-28 sm:text-[3rem]"
              />
              <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
                <Eyebrow>{agency.city ? `Agence partenaire · ${agency.city}` : "Agence partenaire"}</Eyebrow>
                <h1 className="font-display text-text-strong m-0 text-[2.5rem] leading-[0.95] font-normal tracking-[-0.03em] text-balance sm:text-6xl lg:text-7xl">
                  <RevealLines play="mount" delay={0.1} lines={[agency.name]} />
                </h1>
              </div>
            </div>
            <dl className="m-0 grid grid-cols-3 gap-4 lg:col-span-4">
              {counts.map((item) => (
                <div key={item.label} className="border-border-default flex flex-col gap-2 border-t pt-3">
                  <dt className="site-label text-text-muted order-2">{item.label}</dt>
                  <dd className="font-display text-text-strong order-1 m-0 text-4xl leading-none tracking-[-0.03em] sm:text-5xl">
                    {formatNumber(item.value)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <Reveal>
            <AgencyGallery listings={showcase} className="mt-8 sm:mt-10" />
          </Reveal>

          {/* Coordonnées compactes : liste à filets et bouton d'appel. */}
          <section
            aria-labelledby="coordonnees"
            className="border-border-default mt-8 grid gap-6 border-t pt-6 sm:mt-10 lg:grid-cols-12 lg:items-start lg:gap-8"
          >
            <div className="flex flex-col gap-3 lg:col-span-3">
              <Eyebrow index="01" as="h2" id="coordonnees">
                Contacter l&apos;agence
              </Eyebrow>
              <p className="text-text-muted m-0 max-w-xs text-sm leading-relaxed">
                Pour une visite, appelez-la ou écrivez-lui depuis l&apos;annonce qui vous intéresse.
              </p>
            </div>

            {contacts.length > 0 && (
              <dl className="order-3 m-0 grid gap-x-6 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1.3fr)] lg:order-none lg:col-span-6">
                {contacts.map((item) => (
                  <div key={item.label} className="border-border-default flex flex-col gap-1.5 border-b py-3 sm:border-b-0 sm:py-0">
                    <dt className="site-label text-text-muted">{item.label}</dt>
                    <dd className="text-text-strong m-0 min-w-0 text-base [overflow-wrap:anywhere] sm:text-lg">
                      {item.href ? (
                        <a href={item.href} className="site-link text-inherit">
                          {item.value}
                        </a>
                      ) : (
                        item.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {/* Sur mobile, le bouton d'appel remonte juste sous le titre de la section. */}
            <div className="order-2 flex flex-wrap items-center gap-x-8 gap-y-4 lg:order-none lg:col-span-3 lg:flex-col lg:items-end">
              {agency.phone && (
                <a href={telHref(agency.phone)} className="ax-btn ax-btn--primary ax-btn--lg">
                  <IconPhone className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
                  <span className="ax-btn__label">Appeler l&apos;agence</span>
                </a>
              )}
              <Link href="#annonces" className="site-link text-text-strong inline-flex items-center gap-2 font-medium">
                Voir ses biens <IconArrowDown size={18} stroke={1.75} aria-hidden="true" />
              </Link>
            </div>
          </section>
        </Container>
      </div>

      <Section tone="subtle" id="annonces" labelledBy="annonces-titre" className="scroll-mt-20">
        <Container className="flex flex-col gap-10 lg:gap-14">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              id="annonces-titre"
              index="02"
              eyebrow={countLabel(agency.listings_count, "annonce publiée", "annonces publiées")}
              title={
                <>
                  Les biens de <Highlight>{agency.name}</Highlight>
                </>
              }
            />
            <nav aria-label="Filtrer les annonces de l'agence" className="shrink-0">
              <ul className="border-border-strong m-0 inline-flex list-none gap-1 rounded-full border p-1">
                {FILTERS.map((filter) => {
                  const active = filter.value === listingType;
                  return (
                    <li key={filter.label}>
                      <Link
                        href={hrefFor(1, filter.value)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "inline-flex h-10 items-center rounded-full px-5 text-sm font-medium no-underline transition-colors duration-300",
                          active ? "bg-text-strong text-canvas" : "text-text-strong hover:bg-(--ax-fill-hover)",
                        )}
                      >
                        {filter.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {listings === null ? (
            <Notice
              role="status"
              title={
                <>
                  Annonces momentanément <Highlight>indisponibles</Highlight>
                </>
              }
            >
              <p className="m-0">
                Nous n&apos;arrivons pas à charger les biens de cette agence. Réessayez dans quelques instants.
              </p>
            </Notice>
          ) : listings === "page-not-found" || listings.results.length === 0 ? (
            <Notice
              title={listings === "page-not-found" ? "Cette page n'existe pas" : "Aucun bien dans cette catégorie"}
              action={
                <Link href={hrefFor(1, undefined)} className="ax-btn ax-btn--secondary ax-btn--lg">
                  <span className="ax-btn__label">Voir toutes les annonces de l&apos;agence</span>
                </Link>
              }
            >
              {listings !== "page-not-found" && (
                <p className="m-0">
                  Les annonces de {agency.name} sont mises à jour depuis son logiciel de gestion : revenez bientôt, ou
                  contactez l&apos;agence pour connaître ses biens disponibles.
                </p>
              )}
            </Notice>
          ) : (
            <div>
              {/* Mobile : ruban à faire glisser ; tablette et bureau : grille. */}
              <ul
                aria-label={`Annonces de ${agency.name}`}
                className="-mx-5 my-0 flex list-none snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-x-8 sm:gap-y-14 sm:overflow-visible sm:p-0 lg:grid-cols-3"
              >
                {listings.results.map((listing, index) => (
                  <Reveal as="li" key={listing.id} delay={(index % 3) * 0.08} className="w-[78vw] shrink-0 snap-start sm:w-auto">
                    <PropertyCard listing={listing} />
                  </Reveal>
                ))}
              </ul>
              <Pagination
                page={page}
                pageCount={pageCount}
                hrefFor={(target) => hrefFor(target)}
                label="Pages des annonces de l'agence"
              />
            </div>
          )}
        </Container>
      </Section>

      <AgencyCta />
    </>
  );
}
