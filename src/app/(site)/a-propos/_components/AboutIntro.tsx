"use client";

import { IconArrowRight } from "@tabler/icons-react";
import { motion, type Variants } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";

import { Container } from "@/components/site/layout";
import { Highlight, RevealLines } from "@/components/site/motion";
import { Breadcrumbs } from "@/components/site/PageHero";
import { PHOTOS } from "@/components/site/photos";
import { Eyebrow } from "@/components/site/SectionHeading";
import { formatNumber } from "@/lib/format";

/** Chiffres réels du portail (API publique), ou `null` si l'API ne répond pas. */
export interface AboutFigures {
  listings: number;
  agencies: number;
  rent: number;
  sale: number;
  cities: string[];
}

/*
 * Apparition en cascade de l'« About Section » de 21st (TimelineContent) : chaque élément sort d'un
 * flou en descendant légèrement, avec un délai selon son rang. « Réduire les animations » : MotionConfig
 * du site neutralise les déplacements.
 */
const reveal: Variants = {
  hidden: { opacity: 0, y: -16, filter: "blur(10px)" },
  visible: (rank: number) => ({ opacity: 1, y: 0, filter: "blur(0px)", transition: { delay: rank * 0.12, duration: 0.6 } }),
};
const fade: Variants = {
  hidden: { opacity: 0, filter: "blur(10px)" },
  visible: (rank: number) => ({ opacity: 1, filter: "blur(0px)", transition: { delay: rank * 0.12, duration: 0.8 } }),
};

/**
 * Découpe de la photo (celle du composant d'origine, en unités relatives) : une languette en haut à
 * droite, une encoche en haut pour le sur-titre, une en bas à droite pour le chiffre principal.
 */
const CLIP_PATH =
  "M0.0998072 1H0.422076H0.749756C0.767072 1 0.774207 0.961783 0.77561 0.942675V0.807325C0.777053 0.743631 0.791844 0.731953 0.799059 0.734076H0.969813C0.996268 0.730255 1.00088 0.693206 0.999875 0.675159V0.0700637C0.999875 0.0254777 0.985045 0.00477707 0.977629 0H0.902473C0.854975 0 0.890448 0.138535 0.850165 0.138535H0.0204424C0.00408849 0.142357 0 0.180467 0 0.199045V0.410828C0 0.449045 0.0136283 0.46603 0.0204424 0.469745H0.0523086C0.0696245 0.471019 0.0735527 0.497877 0.0733523 0.511146V0.915605C0.0723903 0.983121 0.090588 1 0.0998072 1Z";

function Figure({ value, children }: { value: number; children: ReactNode }) {
  return (
    <span className="flex items-baseline gap-2">
      <span className="font-display text-accent-text text-3xl leading-none tracking-tight">{formatNumber(value)}</span>
      <span className="text-text-muted text-sm">{children}</span>
    </span>
  );
}

/**
 * Ouverture de la page « À propos » (d'après l'« About Section » de 21st) : une grande photo réelle de
 * Dakar découpée, les chiffres réels du portail en bandeau, le titre et deux colonnes courtes, puis
 * l'appel à nous écrire dans la colonne de droite.
 */
export function AboutIntro({ figures }: { figures: AboutFigures | null }) {
  const plural = (count: number, one: string, many: string) => (count > 1 ? many : one);

  return (
    <section aria-labelledby="apropos-titre" className="pt-8 pb-14 sm:pt-10 sm:pb-20 lg:pb-24">
      <svg aria-hidden="true" width="0" height="0" className="absolute">
        <defs>
          <clipPath id="apropos-decoupe" clipPathUnits="objectBoundingBox">
            <path d={CLIP_PATH} />
          </clipPath>
        </defs>
      </svg>

      <Container>
        <Breadcrumbs crumbs={[{ label: "À propos" }]} />

        <motion.div className="relative mt-6 sm:mt-8" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
          {/* Sur-titre et villes : au-dessus de la photo sur mobile, dans l'encoche du haut ensuite. */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 sm:absolute sm:inset-x-0 sm:top-0 sm:z-10 sm:h-[13.8%] sm:w-[84%] sm:flex-nowrap sm:pb-0">
            <motion.div variants={reveal} custom={0}>
              <Eyebrow>À propos de Dahoo</Eyebrow>
            </motion.div>
            {figures && figures.cities.length > 0 && (
              <motion.ul variants={reveal} custom={1} aria-label="Villes des annonces" className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                {figures.cities.map((city) => (
                  <li key={city} className="site-label bg-surface-solid text-text-strong rounded-full px-3 py-1.5">
                    {city}
                  </li>
                ))}
              </motion.ul>
            )}
          </div>

          <motion.figure
            variants={fade}
            custom={2}
            className="relative m-0 aspect-[4/3] overflow-hidden rounded-md sm:aspect-[5/2] sm:rounded-none sm:[clip-path:url(#apropos-decoupe)]"
          >
            <Image
              src={PHOTOS.dakarCathedraleCarRapide.src}
              alt={PHOTOS.dakarCathedraleCarRapide.alt}
              fill
              preload
              sizes="(min-width: 1360px) 1264px, 100vw"
              className="object-cover object-[50%_60%]"
            />
          </motion.figure>

          {/* Chiffre principal, logé dans l'encoche du bas (bureau). */}
          {figures && (
            <motion.p
              variants={reveal}
              custom={4}
              className="m-0 hidden flex-col items-end justify-end gap-1 text-right sm:absolute sm:right-0 sm:bottom-0 sm:flex sm:h-[25%] sm:w-[21%]"
            >
              <span className="font-display text-accent-text text-6xl leading-[0.85] tracking-tight lg:text-8xl">
                {formatNumber(figures.listings)}
              </span>
              <span className="site-label text-text-strong">{plural(figures.listings, "annonce en ligne", "annonces en ligne")}</span>
            </motion.p>
          )}
        </motion.div>

        {/* Bandeau de chiffres réels. */}
        {figures && (
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={reveal}
            custom={3}
            className="border-border-default m-0 mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 border-b pb-4 sm:mt-3 sm:w-[76%] sm:border-b-0"
          >
            <span className="sm:hidden">
              <Figure value={figures.listings}>{plural(figures.listings, "annonce en ligne", "annonces en ligne")}</Figure>
            </span>
            <Figure value={figures.agencies}>{plural(figures.agencies, "agence partenaire", "agences partenaires")}</Figure>
            <span aria-hidden="true" className="text-border-strong hidden sm:inline">
              |
            </span>
            <Figure value={figures.cities.length}>{plural(figures.cities.length, "ville", "villes")}</Figure>
            <span aria-hidden="true" className="text-border-strong hidden sm:inline">
              |
            </span>
            <Figure value={figures.rent}>à louer</Figure>
            <span aria-hidden="true" className="text-border-strong hidden sm:inline">
              |
            </span>
            <Figure value={figures.sale}>à vendre</Figure>
          </motion.p>
        )}

        <div className="mt-10 grid gap-10 sm:mt-14 md:grid-cols-3 md:gap-8">
          <div className="flex flex-col gap-8 md:col-span-2">
            <h1
              id="apropos-titre"
              className="font-display text-text-strong m-0 text-[2.7rem] leading-[0.95] font-normal tracking-[-0.03em] text-balance sm:text-6xl lg:text-[5rem]"
            >
              <RevealLines
                lines={[
                  <Fragment key="titre">
                    Rapprocher les agences <Highlight>et leurs clients</Highlight>
                  </Fragment>,
                ]}
              />
            </h1>
            <motion.div
              className="grid gap-8 sm:grid-cols-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.div variants={reveal} custom={1} className="flex flex-col gap-3">
                <p className="site-label text-text-muted m-0">
                  <span className="text-accent-text">(a)</span> Vous cherchez un bien
                </p>
                <p className="text-text m-0 leading-relaxed">
                  Des biens à louer et à vendre, publiés par les agences qui les gèrent. La visite se demande depuis
                  l&apos;annonce.
                </p>
                <p className="m-0 flex flex-wrap gap-x-6 gap-y-2">
                  <Link href="/louer" className="site-link text-text-strong inline-flex items-center gap-2 font-medium">
                    Biens à louer <IconArrowRight size={16} stroke={1.75} aria-hidden="true" />
                  </Link>
                  <Link href="/acheter" className="site-link text-text-strong inline-flex items-center gap-2 font-medium">
                    Biens à vendre <IconArrowRight size={16} stroke={1.75} aria-hidden="true" />
                  </Link>
                </p>
              </motion.div>
              <motion.div variants={reveal} custom={2} className="flex flex-col gap-3">
                <p className="site-label text-text-muted m-0">
                  <span className="text-accent-text">(b)</span> Vous êtes une agence
                </p>
                <p className="text-text m-0 leading-relaxed">
                  Biens, locataires, baux, loyers et maintenance dans un seul outil, et vos annonces publiées ici.
                </p>
                <p className="m-0 flex flex-wrap gap-x-6 gap-y-2">
                  <Link href="/pour-les-agences" className="site-link text-text-strong inline-flex items-center gap-2 font-medium">
                    L&apos;offre agences <IconArrowRight size={16} stroke={1.75} aria-hidden="true" />
                  </Link>
                  <Link href="/tarifs" className="site-link text-text-strong inline-flex items-center gap-2 font-medium">
                    Tarifs <IconArrowRight size={16} stroke={1.75} aria-hidden="true" />
                  </Link>
                </p>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            className="border-border-default flex flex-col items-start gap-3 border-t pt-8 md:items-end md:border-t-0 md:pt-2 md:text-right"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.p variants={reveal} custom={1} className="font-display text-accent-text m-0 text-4xl leading-none">
              Dahoo
            </motion.p>
            <motion.p variants={reveal} custom={2} className="site-label text-text-muted m-0">
              Portail d&apos;annonces · Gestion locative
            </motion.p>
            <motion.p variants={reveal} custom={3} className="text-text-strong m-0 mt-6 max-w-xs text-lg font-medium">
              Une question sur Dahoo&nbsp;? Nous vous orientons vers la bonne personne.
            </motion.p>
            <motion.div variants={reveal} custom={4} className="mt-2">
              <Link href="/contact" className="ax-btn ax-btn--primary ax-btn--lg">
                <span className="ax-btn__label">Nous contacter</span>
                <IconArrowRight className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
              </Link>
            </motion.div>
            <motion.div variants={reveal} custom={5}>
              <Link href="/agences" className="site-link text-text-strong inline-flex items-center gap-2 text-sm font-medium">
                Voir les agences partenaires <IconArrowRight size={16} stroke={1.75} aria-hidden="true" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
