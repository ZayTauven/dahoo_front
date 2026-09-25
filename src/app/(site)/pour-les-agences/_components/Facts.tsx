import Image from "next/image";

import { Container, Section } from "@/components/site/layout";
import { Highlight, Reveal } from "@/components/site/motion";
import { PHOTOS } from "@/components/site/photos";
import { Eyebrow } from "@/components/site/SectionHeading";

import { MODULES, ROLES } from "./offer";
import { PaymentPills } from "./Screen";

/** Grand chiffre en serif (valeur d'un fait de l'offre). */
function Figure({ children }: { children: string }) {
  return <span className="font-display block text-7xl leading-[0.85] tracking-[-0.04em] sm:text-8xl">{children}</span>;
}

/**
 * Faits clés de l'offre (d'après le « Stats Bento » de 21st) : une photo réelle porte le titre,
 * les tuiles donnent les faits (aucune statistique inventée). Grille pleine sur mobile comme sur
 * ordinateur.
 */
export function Facts() {
  return (
    <Section labelledBy="faits-titre">
      <Container>
        <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 md:grid-cols-6 md:grid-rows-[repeat(2,minmax(14rem,auto))]">
          <Reveal as="li" className="relative isolate col-span-2 min-h-[22rem] overflow-hidden rounded-md md:row-span-2">
            <Image
              src={PHOTOS.immeublePalmiers.src}
              alt={PHOTOS.immeublePalmiers.alt}
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="-z-10 object-cover"
            />
            <span aria-hidden="true" className="from-brand-900/85 via-brand-900/25 absolute inset-0 -z-10 bg-linear-to-t to-transparent" />
            <div className="flex h-full flex-col justify-end gap-4 p-6 sm:p-8">
              <Eyebrow index="03" className="text-white/75 [&>span:first-child]:text-white">
                En bref
              </Eyebrow>
              <h2 id="faits-titre" className="font-display m-0 text-4xl leading-none font-normal tracking-tight text-balance text-white sm:text-5xl">
                L&apos;offre, <Highlight>en cinq faits</Highlight>
              </h2>
            </div>
          </Reveal>

          <Reveal as="li" delay={0.06} className="bg-accent text-on-accent relative col-span-2 flex flex-col justify-between gap-6 overflow-hidden rounded-md p-6 sm:p-7">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(45deg,var(--ax-on-accent)_0px_1px,transparent_1px_10px)] opacity-15 [mask-image:radial-gradient(ellipse_80%_60%_at_100%_0%,#000_60%,transparent_100%)]"
            />
            <p className="site-label relative m-0 opacity-80">Essai gratuit</p>
            <p className="relative m-0 flex items-end gap-3">
              <Figure>30</Figure>
              <span className="pb-1 text-lg leading-tight font-medium">
                jours, toutes
                <br />
                fonctionnalités
              </span>
            </p>
          </Reveal>

          <Reveal as="li" delay={0.12} className="bg-surface-solid col-span-2 flex flex-col justify-between gap-5 rounded-md p-6 sm:p-7">
            <p className="text-text-strong m-0 flex items-end gap-3">
              <Figure>6</Figure>
              <span className="text-text-muted pb-1 leading-tight">modules reliés</span>
            </p>
            <ul aria-label="Modules" className="m-0 flex list-none flex-wrap gap-1.5 p-0">
              {MODULES.map((module) => (
                <li key={module} className="border-border-strong text-text-strong rounded-full border px-3 py-1 text-xs">
                  {module}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal as="li" delay={0.18} className="bg-surface-solid col-span-1 flex flex-col justify-between gap-5 rounded-md p-6 sm:p-7">
            <p className="text-text-strong m-0 flex flex-col gap-2">
              <Figure>4</Figure>
              <span className="text-text-muted leading-tight">rôles d&apos;équipe</span>
            </p>
            <p className="site-label text-text-muted m-0 hidden xl:block">{ROLES.join(" · ")}</p>
          </Reveal>

          <Reveal as="li" delay={0.24} className="site-dark col-span-2 flex flex-col justify-between gap-5 rounded-md p-6 sm:p-7 max-md:order-last">
            <p className="site-label text-text-muted m-0">Mobile Money</p>
            <PaymentPills />
            <p className="text-text-strong m-0 leading-snug">Loyers reçus par Wave et Orange Money, enregistrés avec leur référence.</p>
          </Reveal>

          <Reveal as="li" delay={0.3} className="bg-surface-solid col-span-1 flex flex-col justify-between gap-5 rounded-md p-6 sm:p-7">
            <p className="text-text-strong m-0 flex flex-col gap-2">
              <Figure>0</Figure>
              <span className="text-text-muted leading-tight">installation</span>
            </p>
            <p className="site-label text-text-muted m-0">Dans le navigateur</p>
          </Reveal>
        </ul>
      </Container>
    </Section>
  );
}
