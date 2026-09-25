import { IconArrowUpRight } from "@tabler/icons-react";
import Link from "next/link";
import { Fragment } from "react";

import { Container } from "@/components/site/layout";
import { Highlight, RevealLines } from "@/components/site/motion";
import { Breadcrumbs } from "@/components/site/PageHero";
import { Eyebrow } from "@/components/site/SectionHeading";

const NEXT_STEPS = [
  { label: "Voir les biens à louer", text: "Appartements, villas et studios", href: "/louer" },
  { label: "Voir les biens à vendre", text: "Maisons, appartements et terrains", href: "/acheter" },
  { label: "Contacter une agence", text: "Les agences partenaires de Dahoo", href: "/agences" },
];

/** Annonce inexistante, retirée ou louée entre-temps (404 de l'API ou identifiant invalide). */
export default function ListingNotFound() {
  return (
    <div className="pt-10 pb-24 sm:pt-14 sm:pb-32">
      <Container>
        <Breadcrumbs crumbs={[{ label: "Annonce introuvable" }]} />

        <div className="mt-14 grid gap-10 sm:mt-20 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="flex flex-col gap-6 lg:col-span-8">
            <Eyebrow index="404">Annonce introuvable</Eyebrow>
            <h1 className="font-display text-text-strong m-0 text-[3.1rem] leading-[0.94] font-normal tracking-[-0.03em] text-balance sm:text-7xl lg:text-[6.75rem]">
              <RevealLines
                play="mount"
                delay={0.1}
                lines={[
                  <Fragment key="titre">
                    Cette annonce n&apos;est plus <Highlight>disponible</Highlight>
                  </Fragment>,
                ]}
              />
            </h1>
          </div>
          <p className="text-text-muted m-0 text-base leading-relaxed text-pretty sm:text-lg lg:col-span-4 lg:pb-3">
            Le bien a peut-être déjà été loué ou vendu, ou l&apos;agence a retiré son annonce. D&apos;autres biens vous attendent
            sur Dahoo.
          </p>
        </div>

        <nav aria-label="Poursuivre la recherche" className="mt-16 sm:mt-24">
          <ol className="m-0 list-none p-0">
            {NEXT_STEPS.map((step, index) => (
              <li key={step.href} className="border-border-default border-t last:border-b">
                <Link
                  href={step.href}
                  className="group text-text-strong grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 gap-y-1 py-6 no-underline sm:grid-cols-[4rem_1.2fr_1fr_auto] sm:gap-x-8 sm:py-8"
                >
                  <span className="site-label text-text-muted">{String(index + 1).padStart(2, "0")}</span>
                  <span className="font-display text-3xl leading-tight tracking-tight transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3 sm:text-5xl">
                    {step.label}
                  </span>
                  <span className="text-text-muted col-start-2 row-start-2 sm:col-start-3 sm:row-start-1">{step.text}</span>
                  <span
                    aria-hidden="true"
                    className="border-border-strong group-hover:bg-accent group-hover:text-on-accent col-start-3 row-span-2 row-start-1 flex size-12 items-center justify-center rounded-full border transition-colors duration-500 group-hover:border-transparent sm:col-start-4 sm:row-span-1 sm:size-14"
                  >
                    <IconArrowUpRight size={22} stroke={1.5} className="transition-transform duration-500 group-hover:rotate-45" />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </Container>
    </div>
  );
}
