import { IconCalendarEvent, IconShieldCheck, IconUsersGroup, type Icon } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

import { Container, Section } from "@/components/site/layout";
import { Highlight, Reveal } from "@/components/site/motion";
import { SectionHeading } from "@/components/site/SectionHeading";
import { formatNumber } from "@/lib/format";

const REASONS: { icon: Icon; title: string; text: string }[] = [
  {
    icon: IconShieldCheck,
    title: "Des annonces tenues à jour par les agences",
    text: "Chaque bien est publié depuis le logiciel de l'agence qui le gère : prix, photos et disponibilité suivent la réalité.",
  },
  {
    icon: IconCalendarEvent,
    title: "Des visites organisées pour vous",
    text: "Demandez une visite en quelques secondes : l'agence vous rappelle pour convenir d'un créneau.",
  },
];

/** « Why choose us » de Crafto, sans note inventée : l'encart affiche le nombre réel d'agences. */
export function WhyDahoo({ agenciesCount }: { agenciesCount: number }) {
  return (
    <Section labelledBy="accueil-pourquoi">
      <Container className="grid items-center gap-12 lg:grid-cols-[5fr_7fr] lg:gap-16">
        <Reveal className="flex flex-col gap-8">
          <SectionHeading
            id="accueil-pourquoi"
            eyebrow="Pourquoi passer par Dahoo"
            title={
              <>
                Des biens réels, <Highlight>des agences</Highlight> joignables.
              </>
            }
          />

          <ul className="m-0 flex list-none flex-col gap-7 p-0">
            {REASONS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-5">
                <span className="bg-accent-wash text-accent-text flex size-16 shrink-0 items-center justify-center rounded-xl">
                  <Icon size={30} stroke={1.5} aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="font-display text-text-strong m-0 text-lg font-semibold">{title}</h3>
                  <p className="text-text-muted m-0 text-[0.95rem] leading-relaxed">{text}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3">
            <Link href="/agences" className="ax-btn ax-btn--primary ax-btn--lg">
              <span className="ax-btn__label">Découvrir les agences</span>
            </Link>
            <Link href="/a-propos" className="ax-btn ax-btn--secondary ax-btn--lg">
              <span className="ax-btn__label">Qui sommes-nous ?</span>
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="relative">
          <div className="relative aspect-[800/786] overflow-hidden rounded-xl">
            <Image
              src="/images/site/immobilier-02.webp"
              alt="Pièce lumineuse d'un logement vide, prête à être visitée"
              fill
              sizes="(min-width: 1200px) 660px, (min-width: 992px) 55vw, 92vw"
              className="object-cover"
            />
          </div>
          {agenciesCount > 0 && (
            <div className="bg-surface-solid border-border-default absolute right-4 bottom-4 flex items-center gap-4 rounded-xl border p-5 shadow-[0_24px_50px_-28px_rgba(20,27,71,0.55)] sm:right-6 sm:bottom-6 sm:p-6">
              <span className="bg-brand text-on-brand flex size-12 items-center justify-center rounded-full">
                <IconUsersGroup size={24} stroke={1.75} aria-hidden="true" />
              </span>
              <p className="m-0 flex flex-col">
                <span className="font-display text-text-strong text-3xl leading-none font-bold">
                  {formatNumber(agenciesCount)}
                </span>
                <span className="text-text-muted text-sm">
                  {agenciesCount > 1 ? "agences partenaires" : "agence partenaire"}
                </span>
              </p>
            </div>
          )}
        </Reveal>
      </Container>
    </Section>
  );
}
