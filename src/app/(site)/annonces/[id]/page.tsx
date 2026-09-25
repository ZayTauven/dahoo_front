import { IconArrowDown, IconArrowRight, IconArrowUpRight } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { Container, Section } from "@/components/site/layout";
import { Highlight, Reveal, RevealLines } from "@/components/site/motion";
import { Breadcrumbs } from "@/components/site/PageHero";
import { listingPrice, PropertyCard } from "@/components/site/PropertyCard";
import { Eyebrow, SectionHeading } from "@/components/site/SectionHeading";
import { formatDate, formatMoney, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

import { getListing, parseListingId, type ListingDetail } from "../_components/data";
import {
  formatPhone,
  galleryPhotos,
  listingBrowse,
  listingCoordinates,
  listingJsonLd,
  listingPlace,
  listingSummary,
  telHref,
  truncate,
} from "../_components/listing";
import { ListingGallery } from "../_components/ListingGallery";
import { VisitRequestForm } from "../_components/VisitRequestForm";

type Props = { params: Promise<{ id: string }> };

async function loadListing(params: Props["params"]): Promise<ListingDetail> {
  const id = parseListingId((await params).id);
  const listing = id ? await getListing(id) : null;
  if (!listing) notFound();
  return listing;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await loadListing(params);
  const title = listing.city ? `${listing.title} — ${listing.city}` : listing.title;
  const description = truncate(listing.description || listingSummary(listing));
  const cover = galleryPhotos(listing)[0];
  const path = `/annonces/${listing.id}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "fr_SN",
      siteName: "Dahoo",
      url: path,
      title,
      description,
      ...(cover ? { images: [{ url: cover.url, alt: cover.alt }] } : {}),
    },
    twitter: {
      card: cover ? "summary_large_image" : "summary",
      title,
      description,
      ...(cover ? { images: [cover.url] } : {}),
    },
  };
}

export default async function ListingPage({ params }: Props) {
  const listing = await loadListing(params);
  const photos = galleryPhotos(listing);
  const place = listingPlace(listing);
  const browse = listingBrowse(listing);
  const isRent = listing.listing_type === "RENT";
  const coords = listingCoordinates(listing);
  const agency = listing.agency;
  const pricePerSquareMeter = !isRent && listing.surface > 0 ? Number(listing.price) / listing.surface : null;
  const jsonLd = listingJsonLd(listing, photos);
  const paragraphs = (listing.description ?? "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const defaultMessage = `Bonjour, je souhaite visiter le bien « ${listing.title} »${place ? ` (${place})` : ""}, réf. ${listing.id}. Merci de me recontacter pour convenir d'un rendez-vous.`;

  /** Chiffres clés sous la galerie : grand chiffre en serif, unité et libellé en étiquette. */
  const figures: Figure[] = [
    { label: "Surface", value: formatNumber(listing.surface), unit: "m²" },
    ...(listing.bedrooms != null ? [{ label: listing.bedrooms > 1 ? "Chambres" : "Chambre", value: pad(listing.bedrooms) }] : []),
    ...(listing.bathrooms != null
      ? [{ label: listing.bathrooms > 1 ? "Salles de bain" : "Salle de bain", value: pad(listing.bathrooms) }]
      : []),
    ...(listing.parking_spaces != null && listing.parking_spaces > 0
      ? [{ label: listing.parking_spaces > 1 ? "Places de parking" : "Place de parking", value: pad(listing.parking_spaces) }]
      : []),
  ];

  const specs: Spec[] = [
    { label: "Type de bien", value: listing.category_label },
    { label: "Transaction", value: isRent ? "Location" : "Vente" },
    { label: "Surface", value: `${formatNumber(listing.surface)} m²` },
    ...(listing.bedrooms != null ? [{ label: "Chambres", value: plural(listing.bedrooms, "chambre") }] : []),
    ...(listing.bathrooms != null
      ? [{ label: "Salles de bain", value: plural(listing.bathrooms, "salle de bain", "salles de bain") }]
      : []),
    ...(listing.parking_spaces != null
      ? [{ label: "Parking", value: listing.parking_spaces > 0 ? plural(listing.parking_spaces, "place") : "Sans place de parking" }]
      : []),
    { label: "Meublé", value: listing.is_furnished ? "Oui" : "Non" },
    ...(listing.published_at ? [{ label: "Publiée le", value: formatDate(listing.published_at) }] : []),
    { label: "Référence", value: `DH-${listing.id}` },
  ];

  const tags = [isRent ? "À louer" : "À vendre", listing.category_label, ...(listing.is_furnished ? ["Meublé"] : [])];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* En-tête : fil d'Ariane, titre en très grand serif, puis lieu, prix et agence en étiquettes. */}
      <div className="pt-10 pb-12 sm:pt-14 sm:pb-16">
        <Container>
          <Breadcrumbs crumbs={[{ label: browse.label, href: browse.href }, { label: listing.title }]} />

          <div className="mt-12 grid gap-12 sm:mt-16 lg:grid-cols-12 lg:items-end lg:gap-8">
            <div className="flex flex-col gap-6 lg:col-span-8">
              <Eyebrow>{tags.join(" · ")}</Eyebrow>
              <h1 className="font-display text-text-strong m-0 text-[2.9rem] leading-[0.95] font-normal tracking-[-0.03em] text-balance sm:text-7xl lg:text-[6.25rem] xl:text-[6.75rem]">
                <RevealLines play="mount" delay={0.1} lines={[listing.title]} />
              </h1>
            </div>

            <dl className="m-0 flex flex-col lg:col-span-4 lg:pb-2">
              {place && (
                <div className="border-border-default flex items-baseline justify-between gap-6 border-t py-4">
                  <dt className="site-label text-text-muted">Lieu</dt>
                  <dd className="site-label text-text-strong m-0 text-right">{place}</dd>
                </div>
              )}
              <div className="border-border-default flex flex-col gap-2 border-t py-4">
                <dt className="site-label text-text-muted">{isRent ? "Loyer mensuel" : "Prix de vente"}</dt>
                <dd className="m-0 flex flex-col gap-1">
                  <span className="font-display text-text-strong text-4xl leading-none tracking-tight tabular-nums sm:text-5xl">
                    {listingPrice(listing)}
                  </span>
                  {pricePerSquareMeter != null && (
                    <span className="text-text-muted font-mono text-sm">soit {formatMoney(Math.round(pricePerSquareMeter))} / m²</span>
                  )}
                </dd>
              </div>
              <div className="border-border-default flex items-baseline justify-between gap-6 border-t border-b py-4">
                <dt className="site-label text-text-muted">Agence</dt>
                <dd className="m-0 text-right">
                  <Link href={`/agences/${agency.id}`} className="site-link text-text-strong text-[0.95rem] font-medium">
                    {agency.name}
                  </Link>
                </dd>
              </div>
            </dl>
          </div>

          <a href="#demande-visite" className="ax-btn ax-btn--primary ax-btn--lg ax-btn--block mt-8 lg:hidden">
            <span className="ax-btn__label">Demander une visite</span>
            <IconArrowDown className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
          </a>
        </Container>
      </div>

      {/* Galerie en mosaïque, puis les chiffres clés sur un filet. */}
      <Container>
        <ListingGallery photos={photos} title={listing.title} />

        <dl className="m-0 mt-10 grid grid-cols-2 gap-x-6 gap-y-8 sm:mt-14 lg:grid-cols-4 lg:gap-x-8">
          {figures.map((figure, index) => (
            <Reveal key={figure.label} delay={index * 0.06} className="border-text-strong flex flex-col gap-3 border-t pt-4">
              <dt className="site-label text-text-muted order-2">{figure.label}</dt>
              <dd className="font-display text-text-strong order-1 m-0 flex items-baseline gap-2 text-6xl leading-none tracking-[-0.03em] sm:text-7xl">
                {figure.value}
                {figure.unit && <span className="site-label text-text-muted tracking-[0.08em]">{figure.unit}</span>}
              </dd>
            </Reveal>
          ))}
        </dl>
      </Container>

      {/* Contenu en colonne de lecture + bloc agence et demande de visite. */}
      <Container className="grid gap-20 pt-20 pb-24 sm:pt-28 sm:pb-32 lg:grid-cols-12 lg:gap-8">
        <div className="flex min-w-0 flex-col gap-16 sm:gap-20 lg:col-span-7">
          <DetailSection id="description" index="01" title="Description">
            {paragraphs.length > 0 ? (
              <div className="flex flex-col gap-5">
                {paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className={
                      index === 0
                        ? "font-display text-text-strong m-0 text-[1.75rem] leading-[1.18] tracking-[-0.01em] whitespace-pre-line text-pretty sm:text-[2.1rem]"
                        : "text-text m-0 text-lg leading-relaxed whitespace-pre-line text-pretty"
                    }
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <p className="font-display text-text-strong m-0 text-[1.75rem] leading-[1.18] text-pretty sm:text-[2.1rem]">
                  {listingSummary(listing)}
                </p>
                <p className="text-text-muted m-0 text-lg leading-relaxed">
                  L&apos;agence vous communiquera tous les détails lors de votre prise de contact.
                </p>
              </div>
            )}
          </DetailSection>

          <DetailSection id="caracteristiques" index="02" title="Caractéristiques">
            <dl className="m-0 flex flex-col">
              {specs.map((spec) => (
                <div key={spec.label} className="border-border-default flex items-baseline justify-between gap-4 border-b py-4">
                  <dt className="site-label text-text-muted">{spec.label}</dt>
                  <dd className="text-text-strong m-0 text-right font-mono text-[0.9rem] tabular-nums">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </DetailSection>

          <DetailSection id="localisation" index="03" title="Localisation">
            <p className="font-display text-text-strong m-0 text-3xl leading-tight tracking-tight sm:text-4xl">
              {place || "Localisation communiquée par l'agence"}
            </p>
            {coords ? (
              <div className="flex flex-col gap-4">
                <div className="border-border-default bg-surface-subtle overflow-hidden rounded-md border">
                  <iframe
                    title={`Carte : position approximative du bien${place ? ` à ${place}` : ""}`}
                    src={osmEmbedUrl(coords)}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="block aspect-[4/3] w-full border-0 grayscale-[0.35] sm:aspect-[16/10]"
                  />
                </div>
                <p className="text-text-muted m-0 text-sm leading-relaxed">
                  Position approximative : l&apos;adresse exacte vous sera communiquée par l&apos;agence.{" "}
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}#map=15/${coords.lat}/${coords.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="site-link text-text-strong inline-flex items-center gap-1 font-medium"
                  >
                    Ouvrir la carte dans OpenStreetMap
                    <IconArrowUpRight size={14} stroke={1.75} aria-hidden="true" />
                    <span className="sr-only"> (nouvel onglet)</span>
                  </a>
                </p>
              </div>
            ) : (
              <p className="text-text-muted m-0 text-sm leading-relaxed">
                L&apos;adresse exacte vous sera communiquée par l&apos;agence lors de la prise de rendez-vous.
              </p>
            )}
          </DetailSection>
        </div>

        {/*
          Bloc collant (bureau) : ancré par le bas, il défile avec la page jusqu'à ce que le bouton
          d'envoi soit visible, puis reste en place — même s'il est plus haut que l'écran.
        */}
        <aside aria-label="Contacter l'agence" className="min-w-0 lg:sticky lg:bottom-6 lg:col-span-5 lg:col-start-8 lg:self-end xl:col-span-4 xl:col-start-9">
          <div className="bg-surface-solid flex flex-col gap-10 rounded-md p-6 sm:p-10 lg:p-8 xl:p-10">
            <div className="flex flex-col gap-5">
              <p className="site-label text-text-muted m-0">Proposé par</p>
              <p className="font-display text-text-strong m-0 text-[2.1rem] leading-[1.02] tracking-tight">{agency.name}</p>
              <Link href={`/agences/${agency.id}`} className="site-link text-text-strong inline-flex items-center gap-2 self-start text-[0.95rem] font-medium">
                Voir l&apos;agence et ses annonces <IconArrowRight size={16} stroke={1.75} aria-hidden="true" />
              </Link>

              {(agency.phone || agency.email) && (
                <dl className="m-0 mt-2 flex flex-col">
                  {agency.phone && (
                    <div className="border-border-default flex items-baseline justify-between gap-4 border-t py-3.5">
                      <dt className="site-label text-text-muted">Téléphone</dt>
                      <dd className="m-0 text-right">
                        <a href={telHref(agency.phone)} className="site-link text-text-strong font-mono text-[0.9rem] tabular-nums">
                          <span className="sr-only">Appeler le </span>
                          {formatPhone(agency.phone)}
                        </a>
                      </dd>
                    </div>
                  )}
                  {agency.email && (
                    <div className="border-border-default flex items-baseline justify-between gap-4 border-t border-b py-3.5">
                      <dt className="site-label text-text-muted">E-mail</dt>
                      <dd className="m-0 min-w-0 text-right">
                        <a
                          href={`mailto:${agency.email}?subject=${encodeURIComponent(`Annonce réf. DH-${listing.id} : ${listing.title}`)}`}
                          className="site-link text-text-strong block truncate font-mono text-[0.9rem]"
                        >
                          {agency.email}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              )}
            </div>

            <section
              id="demande-visite"
              aria-labelledby="demande-visite-titre"
              className="border-text-strong flex scroll-mt-28 flex-col gap-6 border-t pt-8"
            >
              <div className="flex flex-col gap-3">
                <h2 id="demande-visite-titre" className="font-display text-text-strong m-0 text-4xl leading-none tracking-tight sm:text-5xl lg:text-[2.75rem]">
                  Demander une <Highlight>visite</Highlight>
                </h2>
                <p className="text-text-muted m-0 text-[0.95rem] leading-relaxed">
                  Laissez vos coordonnées : l&apos;agence vous rappelle pour fixer un rendez-vous.
                </p>
              </div>
              <VisitRequestForm listingId={listing.id} agencyName={agency.name} defaultMessage={defaultMessage} browseHref={browse.href} />
            </section>
          </div>
        </aside>
      </Container>

      {listing.similar.length > 0 && (
        <Section tone="subtle" labelledBy="similaires-titre">
          <Container className="flex flex-col gap-14 lg:gap-20">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading
                id="similaires-titre"
                index="04"
                eyebrow="À découvrir aussi"
                title={
                  <>
                    Biens <Highlight>similaires</Highlight>
                  </>
                }
              />
              <Link href={browse.href} className="site-link text-text-strong inline-flex shrink-0 items-center gap-2 self-start font-medium lg:self-auto">
                {isRent ? "Toutes les locations" : "Tous les biens à vendre"}
                <IconArrowRight size={18} stroke={1.75} aria-hidden="true" />
              </Link>
            </div>
            {/* Une seule suggestion : mise en avant sur sept colonnes ; sinon grille décalée comme les listes. */}
            <ul
              className={cn(
                "m-0 grid list-none gap-x-8 gap-y-16 p-0 sm:grid-cols-2",
                listing.similar.length === 1 ? "lg:grid-cols-12" : "lg:grid-cols-3 lg:[&>li:nth-child(3n+2)]:mt-24",
              )}
            >
              {listing.similar.map((similar, index) => (
                <Reveal
                  as="li"
                  key={similar.id}
                  delay={index * 0.08}
                  className={listing.similar.length === 1 ? "sm:col-span-2 lg:col-span-7" : undefined}
                >
                  <PropertyCard listing={similar} size={listing.similar.length === 1 ? "feature" : "default"} />
                </Reveal>
              ))}
            </ul>
          </Container>
        </Section>
      )}
    </>
  );
}

interface Figure {
  label: string;
  value: string;
  unit?: string;
}

interface Spec {
  label: string;
  value: string;
}

/** Section de la colonne de lecture : numéro et intitulé en étiquette à gauche, contenu à droite. */
function DetailSection({ id, index, title, children }: { id: string; index: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`${id}-titre`} className="border-border-default grid gap-8 border-t pt-6 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6">
      <Eyebrow as="h2" id={`${id}-titre`} index={index} className="self-start sm:pt-1.5">
        {title}
      </Eyebrow>
      <div className="flex min-w-0 flex-col gap-6">{children}</div>
    </section>
  );
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count > 1 ? pluralForm : singular}`;
}

/** Carte OpenStreetMap intégrée, centrée sur la position arrondie de l'annonce (≈ 1,5 km de large). */
function osmEmbedUrl({ lat, lng }: { lat: number; lng: number }): string {
  const dLat = 0.007;
  const dLng = 0.012;
  const bbox = [lng - dLng, lat - dLat, lng + dLng, lat + dLat].map((value) => value.toFixed(5)).join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
}
