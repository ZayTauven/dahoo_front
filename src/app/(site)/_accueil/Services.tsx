import { IconBuildingEstate, IconCalculator, IconCircleCheck, IconHomeDollar, IconKey, type Icon } from "@tabler/icons-react";
import Link from "next/link";

import { Container, Section } from "@/components/site/layout";
import { Highlight, Reveal } from "@/components/site/motion";
import { SectionHeading } from "@/components/site/SectionHeading";
import { cn } from "@/lib/utils";

import { countLabel } from "./text";

const SERVICES: { icon: Icon; title: string; text: string; href: string }[] = [
  {
    icon: IconKey,
    title: "Louer un logement",
    text: "Appartements, villas et studios, loyer mensuel affiché.",
    href: "/louer",
  },
  {
    icon: IconHomeDollar,
    title: "Acheter un bien",
    text: "Maisons, appartements et terrains proposés par des agences.",
    href: "/acheter",
  },
  {
    icon: IconBuildingEstate,
    title: "Confier sa gestion",
    text: "Une agence partenaire loue votre bien et encaisse les loyers.",
    href: "/agences",
  },
  {
    icon: IconCalculator,
    title: "Faire estimer un bien",
    text: "Une agence du quartier vous indique son prix de marché.",
    href: "/agences",
  },
];

/** « Recognized for exceeding client » de Crafto : quatre services en colonnes séparées. */
export function Services({ listingsCount, agenciesCount }: { listingsCount: number; agenciesCount: number }) {
  return (
    <Section labelledBy="accueil-services">
      <Container className="flex flex-col gap-12">
        <SectionHeading
          id="accueil-services"
          align="center"
          eyebrow="Particuliers et propriétaires"
          title={
            <>
              Tout votre projet <Highlight>immobilier</Highlight>
            </>
          }
        />

        <ul className="m-0 grid list-none gap-y-10 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map(({ icon: Icon, title, text, href }, index) => (
            <Reveal
              as="li"
              key={title}
              delay={index * 0.08}
              className={cn(
                "border-border-default px-4 text-center sm:px-6",
                index % 2 === 0 && "sm:border-r",
                "lg:border-r lg:last:border-r-0",
              )}
            >
              <Link href={href} className="group flex flex-col items-center gap-2 no-underline">
                <span className="relative mb-3 flex size-24 items-center justify-center">
                  <span
                    aria-hidden="true"
                    className="bg-accent-wash absolute inset-0 rounded-full transition-transform duration-500 [clip-path:polygon(50%_0,100%_0,100%_100%,0_100%,0_50%,50%_50%)] group-hover:rotate-90"
                  />
                  <Icon size={36} stroke={1.5} aria-hidden="true" className="text-text-strong relative" />
                </span>
                <span className="font-display text-text-strong text-lg font-semibold group-hover:underline">{title}</span>
                <span className="text-text-muted mx-auto max-w-[15rem] text-[0.95rem] leading-relaxed">{text}</span>
              </Link>
            </Reveal>
          ))}
        </ul>

        {listingsCount > 0 && agenciesCount > 0 && (
          <p className="text-text m-0 flex flex-wrap items-center justify-center gap-2 text-center">
            <IconCircleCheck size={24} stroke={1.75} className="text-accent-text" aria-hidden="true" />
            <span>
              Aujourd&apos;hui sur Dahoo :{" "}
              <Link href="/agences" className="text-text-strong font-semibold underline underline-offset-4">
                {countLabel(agenciesCount, "agence partenaire", "agences partenaires")}
              </Link>{" "}
              et{" "}
              <Link href="/louer" className="text-text-strong font-semibold underline underline-offset-4">
                {countLabel(listingsCount, "annonce en ligne", "annonces en ligne")}
              </Link>
              .
            </span>
          </p>
        )}
      </Container>
    </Section>
  );
}
