import { IconArrowRight } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

import { Container, Section } from "@/components/site/layout";
import { Highlight, Parallax, Reveal } from "@/components/site/motion";
import { Eyebrow } from "@/components/site/SectionHeading";

/**
 * Appel aux agences des pages « annuaire ». Même encre et mêmes vraies captures que celui de l'accueil,
 * mais centré sur ce que voit l'agence au moment de publier : l'écran des annonces, légèrement incliné,
 * et un gros plan de ses biens. Le message tient en une ligne.
 */
export function AgencyCta() {
  return (
    <Section tone="brand" labelledBy="cta-agence" className="overflow-hidden">
      <Container className="grid items-center gap-14 lg:grid-cols-12 lg:gap-8">
        <Reveal className="flex flex-col gap-7 lg:col-span-5">
          <Eyebrow>Vous êtes une agence immobilière&nbsp;?</Eyebrow>
          <h2
            id="cta-agence"
            className="font-display text-text-strong m-0 text-[2.6rem] leading-[0.95] font-normal tracking-[-0.03em] text-balance sm:text-6xl lg:text-[4.25rem]"
          >
            Votre agence a sa place <Highlight>dans l&apos;annuaire</Highlight>
          </h2>
          <p className="text-text-muted m-0 max-w-md text-base leading-relaxed sm:text-lg">
            Vos annonces partent d&apos;ici, depuis le logiciel qui gère déjà vos biens, baux et loyers.
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link href="/pour-les-agences" className="ax-btn ax-btn--primary ax-btn--lg">
              <span className="ax-btn__label">Découvrir l&apos;offre agences</span>
            </Link>
            <Link href="/contact?profil=agence" className="site-link text-text-strong inline-flex items-center gap-2 font-medium">
              Demander une démo <IconArrowRight size={18} stroke={1.75} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>

        {/* Captures réelles (données de démonstration), en situation : l'écran incliné, puis un gros plan. */}
        <div className="relative pb-16 sm:pb-20 lg:col-span-7 lg:pb-12 lg:pl-6">
          <Reveal className="origin-bottom-left lg:rotate-[-2deg]">
            <div className="border-border-strong overflow-hidden rounded-lg border shadow-[0_40px_80px_-30px_rgba(0,0,0,0.55)]">
              <Image
                src="/images/site/app/annonces.webp"
                alt="Espace agence Dahoo : la liste des annonces publiées sur le portail, avec leur photo, leur prix et leur statut"
                width={2880}
                height={1800}
                sizes="(min-width: 992px) 55vw, 100vw"
                className="block h-auto w-full"
              />
            </div>
          </Reveal>

          <Parallax distance={40} className="absolute right-0 bottom-0 w-[74%] sm:w-[62%] lg:-right-4">
            <figure className="m-0 flex flex-col gap-2">
              <div className="border-border-strong bg-surface-solid relative aspect-[5/2] overflow-hidden rounded-lg border shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]">
                <Image
                  src="/images/site/app/biens.webp"
                  alt="Gros plan de l'écran des biens : chaque résidence, ses lots et leur taux d'occupation"
                  width={2880}
                  height={1800}
                  sizes="(min-width: 992px) 60vw, 130vw"
                  className="absolute top-[-117%] left-[-36%] h-auto w-[170%] max-w-none"
                />
              </div>
              <figcaption className="site-label text-text-muted self-end">Vos biens, lots et occupation</figcaption>
            </figure>
          </Parallax>

          <p className="site-label bg-accent text-on-accent absolute -top-4 right-3 m-0 flex items-center gap-2 rounded-full px-3.5 py-2 shadow-lg sm:right-8 lg:-top-7">
            <span aria-hidden="true" className="bg-on-accent size-1.5 rounded-full" />
            Publiée en moins d&apos;une minute
          </p>
        </div>
      </Container>
    </Section>
  );
}
