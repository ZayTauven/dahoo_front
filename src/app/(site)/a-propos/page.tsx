import {
  IconArrowRight,
  IconBuildingStore,
  IconCheck,
  IconEye,
  IconHeartHandshake,
  IconHomeSearch,
  IconMapPin2,
  IconSparkles,
  type TablerIcon,
} from "@tabler/icons-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Container, Section } from "@/components/site/layout";
import { Highlight, Reveal } from "@/components/site/motion";
import { SectionHeading } from "@/components/site/SectionHeading";
import { publicApi } from "@/lib/api/server";
import type { Schema } from "@/lib/api/types";
import { formatNumber } from "@/lib/format";

import { PageBanner } from "../agences/_components/PageBanner";

export const metadata: Metadata = {
  title: "À propos de Dahoo",
  description:
    "Dahoo rapproche les agences immobilières du Sénégal et leurs clients : un portail d'annonces à louer et à vendre, et un outil qui digitalise la gestion locative des agences.",
  alternates: { canonical: "/a-propos" },
};

/** Compteurs réels du portail ; `null` si l'API ne répond pas (la section des chiffres est alors masquée). */
async function getStats(): Promise<Schema<"PublicStats"> | null> {
  try {
    const { data } = await publicApi.GET("/api/v1/public/stats/");
    return data ?? null;
  } catch {
    return null;
  }
}

const AUDIENCES: {
  id: string;
  icon: TablerIcon;
  eyebrow: string;
  title: string;
  image: string;
  points: string[];
  links: { label: string; href: string; primary?: boolean }[];
}[] = [
  {
    id: "public",
    icon: IconHomeSearch,
    eyebrow: "Pour vous qui cherchez un bien",
    title: "Trouver un logement ou un local, sans détour",
    image: "/images/site/property-05.webp",
    points: [
      "Des biens à louer et à vendre, publiés directement par les agences.",
      "Une recherche par ville, type de bien, budget en francs CFA et nombre de chambres.",
      "Une demande de visite envoyée depuis l'annonce, à l'agence qui gère le bien.",
      "Les coordonnées de chaque agence partenaire et la liste de ses biens.",
    ],
    links: [
      { label: "Biens à louer", href: "/louer", primary: true },
      { label: "Biens à vendre", href: "/acheter" },
    ],
  },
  {
    id: "agences",
    icon: IconBuildingStore,
    eyebrow: "Pour les agences immobilières",
    title: "Une gestion locative enfin digitalisée",
    image: "/images/site/property-03.webp",
    points: [
      "Les annonces publiées sur le portail, et les demandes de visite reçues au même endroit.",
      "Le suivi des biens, des locataires et des baux.",
      "Les échéances et les paiements de loyers, avec les retards en un coup d'œil.",
      "Les demandes de maintenance et le travail de toute l'équipe de l'agence.",
    ],
    links: [
      { label: "Découvrir l'offre agences", href: "/pour-les-agences", primary: true },
      { label: "Voir les tarifs", href: "/tarifs" },
    ],
  },
];

const VALUES: { icon: TablerIcon; title: string; text: string }[] = [
  {
    icon: IconEye,
    title: "Transparence",
    text: "Des prix affichés en francs CFA et des annonces qui indiquent toujours l'agence qui les publie.",
  },
  {
    icon: IconMapPin2,
    title: "Proximité",
    text: "Une plateforme pensée pour le marché sénégalais, avec les agences qui le connaissent le mieux.",
  },
  {
    icon: IconSparkles,
    title: "Simplicité",
    text: "Chercher un bien ou gérer des dizaines de locations doit rester simple, sur téléphone comme sur ordinateur.",
  },
  {
    icon: IconHeartHandshake,
    title: "Confiance",
    text: "Chaque annonce est rattachée à une agence identifiée, que vous pouvez contacter directement.",
  },
];

export default async function AboutPage() {
  const stats = await getStats();
  const rentCount = stats?.by_type.find((entry) => entry.listing_type === "RENT")?.count ?? 0;
  const saleCount = stats?.by_type.find((entry) => entry.listing_type === "SALE")?.count ?? 0;

  const figures = stats
    ? [
        { value: stats.listings_count, label: stats.listings_count > 1 ? "annonces en ligne" : "annonce en ligne" },
        { value: stats.agencies_count, label: stats.agencies_count > 1 ? "agences partenaires" : "agence partenaire" },
        { value: stats.cities.length, label: stats.cities.length > 1 ? "villes couvertes" : "ville couverte" },
        { value: rentCount, label: rentCount > 1 ? "biens à louer" : "bien à louer" },
        { value: saleCount, label: saleCount > 1 ? "biens à vendre" : "bien à vendre" },
      ]
    : [];

  return (
    <>
      <PageBanner
        eyebrow="À propos de Dahoo"
        title={
          <>
            Rapprocher les agences <br className="hidden sm:inline" />
            et leurs clients.
          </>
        }
        lede="Dahoo est à la fois le portail d'annonces des agences immobilières du Sénégal et l'outil qui simplifie leur gestion locative au quotidien."
        crumbs={[{ label: "À propos" }]}
        image="/images/site/slider-02.webp"
        watermark="dahoo"
      />

      {/* Mission */}
      <Section labelledBy="mission">
        <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative aspect-[800/786] overflow-hidden rounded-2xl">
              <Image
                src="/images/site/immobilier-02.webp"
                alt="Un couple déballe des cartons dans son nouveau logement."
                fill
                sizes="(min-width: 992px) 560px, (min-width: 576px) 448px, 100vw"
                className="object-cover"
              />
            </div>
            {stats && stats.listings_count > 0 && (
              <div className="bg-accent text-on-accent absolute -bottom-6 left-4 flex items-center gap-3 rounded-xl px-5 py-4 shadow-lg sm:left-auto sm:-right-6">
                <span className="font-display text-4xl leading-none font-bold">{formatNumber(stats.listings_count)}</span>
                <span className="text-sm leading-tight font-semibold">
                  {stats.listings_count > 1 ? "annonces" : "annonce"}
                  <br />
                  en ligne aujourd&apos;hui
                </span>
              </div>
            )}
          </Reveal>

          <Reveal delay={0.1} className="flex flex-col gap-6">
            <SectionHeading
              id="mission"
              eyebrow="Notre mission"
              title={
                <>
                  Rendre l&apos;immobilier <Highlight>plus simple</Highlight> au Sénégal
                </>
              }
            >
              <p className="m-0">
                Au Sénégal, trouver un appartement, une maison ou un local commercial passe souvent par une agence.
                Dahoo réunit en un même endroit les biens que ces agences proposent, pour que chacun puisse chercher
                facilement et contacter directement la bonne agence.
              </p>
              <p className="m-0 mt-4">
                Dahoo accompagne aussi les agences dans la digitalisation de leur gestion locative : biens, locataires,
                baux, loyers et maintenance sont suivis au même endroit, par toute l&apos;équipe.
              </p>
            </SectionHeading>

            <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
              {["Annonces publiées par les agences", "Prix affichés en francs CFA", "Contact direct avec l'agence", "Un outil de gestion complet"].map(
                (item) => (
                  <li key={item} className="text-text-strong flex items-start gap-2 font-medium">
                    <IconCheck size={20} stroke={2.25} aria-hidden="true" className="text-accent-text mt-0.5 shrink-0" />
                    {item}
                  </li>
                ),
              )}
            </ul>
          </Reveal>
        </Container>
      </Section>

      {/* Ce que Dahoo apporte */}
      <Section tone="subtle" labelledBy="apport">
        <Container>
          <Reveal>
            <SectionHeading
              id="apport"
              eyebrow="Ce que Dahoo apporte"
              align="center"
              title={
                <>
                  Un seul service, <Highlight>deux publics</Highlight>
                </>
              }
            >
              <p className="m-0">Le grand public trouve des biens ; les agences gagnent du temps pour s&apos;en occuper.</p>
            </SectionHeading>
          </Reveal>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {AUDIENCES.map((audience, index) => {
              const AudienceIcon = audience.icon;
              return (
                <Reveal
                  key={audience.id}
                  as="article"
                  delay={index * 0.1}
                  className="border-border-default flex flex-col overflow-hidden rounded-2xl border bg-[var(--ax-surface-solid)] shadow-card"
                >
                  <div className="relative aspect-[600/250] overflow-hidden">
                    <Image src={audience.image} alt="" fill sizes="(min-width: 992px) 584px, 100vw" className="object-cover" />
                    <span className="bg-accent text-on-accent absolute bottom-4 left-6 inline-flex size-12 items-center justify-center rounded-full shadow-md">
                      <AudienceIcon size={24} stroke={1.75} aria-hidden="true" />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-5 p-6 sm:p-8">
                    <div className="flex flex-col gap-2">
                      <p className="text-accent-text m-0 text-sm font-semibold">{audience.eyebrow}</p>
                      <h3 className="font-display text-text-strong m-0 text-2xl leading-tight font-semibold">{audience.title}</h3>
                    </div>
                    <ul className="m-0 flex list-none flex-col gap-3 p-0">
                      {audience.points.map((point) => (
                        <li key={point} className="text-text flex items-start gap-2.5 leading-relaxed">
                          <IconCheck size={20} stroke={2.25} aria-hidden="true" className="text-accent-text mt-0.5 shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto flex flex-col gap-3 pt-2 sm:flex-row">
                      {audience.links.map((link) => (
                        <Link key={link.href} href={link.href} className={`ax-btn ${link.primary ? "ax-btn--primary" : "ax-btn--secondary"}`}>
                          <span className="ax-btn__label">{link.label}</span>
                          {link.primary && <IconArrowRight className="ax-btn__icon" stroke={2} aria-hidden="true" />}
                        </Link>
                      ))}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Valeurs */}
      <Section labelledBy="valeurs">
        <Container>
          <Reveal>
            <SectionHeading
              id="valeurs"
              eyebrow="Nos valeurs"
              title={
                <>
                  Ce qui guide <Highlight>notre travail</Highlight>
                </>
              }
            />
          </Reveal>
          <ul className="m-0 mt-12 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value, index) => {
              const ValueIcon = value.icon;
              return (
                <Reveal as="li" key={value.title} delay={index * 0.08} className="border-border-default flex flex-col gap-4 border-t-2 pt-6">
                  <span className="bg-accent-wash text-accent-text inline-flex size-14 items-center justify-center rounded-full">
                    <ValueIcon size={28} stroke={1.5} aria-hidden="true" />
                  </span>
                  <h3 className="font-display text-text-strong m-0 text-xl font-semibold">{value.title}</h3>
                  <p className="text-text-muted m-0 leading-relaxed">{value.text}</p>
                </Reveal>
              );
            })}
          </ul>
        </Container>
      </Section>

      {/* Chiffres réels du portail */}
      {figures.length > 0 && (
        <Section tone="brand" labelledBy="chiffres">
          <Container>
            <Reveal>
              <SectionHeading
                id="chiffres"
                invert
                eyebrow="Dahoo en chiffres"
                title="Le portail aujourd'hui"
              >
                <p className="m-0">Ces chiffres proviennent directement des annonces en ligne et sont mis à jour en continu.</p>
              </SectionHeading>
            </Reveal>
            <dl className="m-0 mt-12 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-5">
              {figures.map((figure, index) => (
                <Reveal key={figure.label} delay={index * 0.06} className="flex flex-col gap-2 border-l-2 border-white/15 pl-5">
                  <dt className="order-2 text-sm font-medium text-white/75">{figure.label}</dt>
                  <dd className="font-display text-accent-300 order-1 m-0 text-4xl leading-none font-bold sm:text-5xl">
                    {formatNumber(figure.value)}
                  </dd>
                </Reveal>
              ))}
            </dl>
          </Container>
        </Section>
      )}

      {/* Appel final */}
      <Section labelledBy="suite">
        <Container>
          <Reveal className="flex flex-col items-center gap-6 text-center">
            <SectionHeading
              id="suite"
              align="center"
              title={
                <>
                  Une question sur <Highlight>Dahoo</Highlight> ?
                </>
              }
            >
              <p className="m-0">
                Que vous cherchiez un bien ou que vous dirigiez une agence, nous vous orientons vers la bonne personne.
              </p>
            </SectionHeading>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/contact" className="ax-btn ax-btn--primary ax-btn--lg">
                <span className="ax-btn__label">Nous contacter</span>
                <IconArrowRight className="ax-btn__icon" stroke={2} aria-hidden="true" />
              </Link>
              <Link href="/agences" className="ax-btn ax-btn--secondary ax-btn--lg">
                <span className="ax-btn__label">Voir les agences partenaires</span>
              </Link>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
