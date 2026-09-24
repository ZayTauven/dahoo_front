import { IconArrowRight, IconCheck, IconHomeSearch } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

import { Container, Section } from "@/components/site/layout";
import { Highlight, Reveal } from "@/components/site/motion";
import { SectionHeading } from "@/components/site/SectionHeading";
import { formatNumber } from "@/lib/format";

import { countLabel } from "./text";

const POINTS = [
  "Des annonces publiées directement par les agences qui gèrent les biens.",
  "Une demande de visite en ligne, sans créer de compte.",
];

/** « We help you find your new place » de Crafto : photo, encart chiffré réel, deux arguments. */
export function Intro({ listingsCount, agenciesCount }: { listingsCount: number; agenciesCount: number }) {
  return (
    <Section labelledBy="accueil-presentation">
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal className="relative pr-6 pb-6 sm:pr-10 sm:pb-10">
          <div className="relative aspect-square overflow-hidden rounded-xl">
            <Image
              src="/images/site/immobilier-01.webp"
              alt="Façade blanche d'une villa contemporaine à portes en bois, ombragée par un arbre"
              fill
              sizes="(min-width: 992px) 540px, 92vw"
              className="object-cover"
            />
          </div>
          <div className="bg-accent text-on-accent absolute right-0 bottom-0 flex max-w-[15rem] flex-col gap-2 rounded-xl p-6 shadow-[0_24px_50px_-28px_rgba(20,27,71,0.55)] sm:p-8">
            <IconHomeSearch size={32} stroke={1.5} aria-hidden="true" />
            {listingsCount > 0 ? (
              <>
                <p className="font-display m-0 text-4xl leading-none font-bold">{formatNumber(listingsCount)}</p>
                <p className="m-0 text-sm font-medium">
                  {listingsCount > 1 ? "annonces publiées" : "annonce publiée"}
                  {agenciesCount > 0 && ` par ${countLabel(agenciesCount, "agence")}`}
                </p>
              </>
            ) : (
              <p className="font-display m-0 text-lg leading-snug font-semibold">
                Les biens des agences partenaires, réunis au même endroit
              </p>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.1} className="flex flex-col gap-8">
          <SectionHeading
            id="accueil-presentation"
            eyebrow="Portail immobilier des agences"
            title={
              <>
                Nous vous aidons à trouver <Highlight>votre nouveau</Highlight> chez-vous.
              </>
            }
          >
            <p className="m-0">
              Appartements, villas, studios, bureaux ou terrains : Dahoo réunit les biens à louer et à vendre des
              agences immobilières du Sénégal, avec des prix en francs CFA et des photos à jour.
            </p>
          </SectionHeading>

          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {POINTS.map((point) => (
              <li key={point} className="text-text flex items-start gap-3">
                <span className="bg-accent-wash text-accent-text mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full">
                  <IconCheck size={16} stroke={2.5} aria-hidden="true" />
                </span>
                {point}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href="/louer" className="ax-btn ax-btn--primary ax-btn--lg">
              <span className="ax-btn__label">Voir les biens à louer</span>
            </Link>
            <Link
              href="/pour-les-agences"
              className="text-text-strong hover:text-brand inline-flex items-center gap-1.5 font-semibold no-underline"
            >
              Vous êtes une agence ? <IconArrowRight size={18} stroke={2} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
