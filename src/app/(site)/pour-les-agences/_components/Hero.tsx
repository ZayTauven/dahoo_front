import { IconArrowRight } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";

import { Container } from "@/components/site/layout";
import { Highlight, Parallax, Reveal, RevealImage, RevealLines } from "@/components/site/motion";
import { Breadcrumbs } from "@/components/site/PageHero";
import { PHOTOS } from "@/components/site/photos";
import { Eyebrow } from "@/components/site/SectionHeading";

import { SCREENS } from "./offer";
import { PaymentPills, Screen } from "./Screen";

/**
 * Hero : l'agence reconnaît son quotidien dans le titre, puis voit le logiciel. Scène en trois plans
 * qui glissent à des vitesses différentes : une vraie photo de résidence au fond, la capture des
 * échéances au milieu, celle des paiements au premier plan (légèrement inclinée).
 */
export function Hero() {
  return (
    <section aria-labelledby="agences-titre" className="overflow-hidden pt-8 pb-14 sm:pt-10 sm:pb-20 lg:pb-24">
      <Container>
        <Breadcrumbs crumbs={[{ label: "Pour les agences" }]} />
        <div className="mt-8 grid items-center gap-12 sm:mt-12 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col gap-7 lg:col-span-6">
            <Eyebrow>Logiciel de gestion locative</Eyebrow>
            <h1
              id="agences-titre"
              className="font-display text-text-strong m-0 text-[2.9rem] leading-[0.94] font-normal tracking-[-0.03em] sm:text-7xl lg:text-[4.4rem] xl:text-[4.9rem]"
            >
              <RevealLines
                play="mount"
                delay={0.1}
                lines={[
                  "Vos biens, vos baux,",
                  "vos loyers,",
                  <Fragment key="ligne-3">
                    <Highlight>enfin</Highlight> au même endroit.
                  </Fragment>,
                ]}
              />
            </h1>
            <p className="text-text-muted m-0 max-w-md text-base leading-relaxed text-pretty sm:text-lg">
              Cahiers, fichiers Excel, fils WhatsApp : Dahoo les remplace par un seul espace, partagé par toute l&apos;équipe.
            </p>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <a href="#demo" className="ax-btn ax-btn--primary ax-btn--lg">
                <span className="ax-btn__label">Demander une démo</span>
              </a>
              <Link href="/tarifs" className="site-link text-text-strong inline-flex items-center gap-2 font-medium">
                Voir les tarifs <IconArrowRight size={18} stroke={1.75} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="relative aspect-5/4 sm:aspect-16/11 lg:col-span-6">
            <RevealImage className="absolute top-0 right-0 h-[74%] w-[70%] rounded-md">
              <Parallax distance={30} className="absolute -inset-y-10 inset-x-0">
                <Image
                  src={PHOTOS.residenceFacadeOcre.src}
                  alt=""
                  fill
                  preload
                  sizes="(min-width: 992px) 30vw, 70vw"
                  className="object-cover"
                />
              </Parallax>
            </RevealImage>

            <div className="absolute top-[15%] left-0 w-[90%]">
              <Parallax distance={18}>
                <Reveal delay={0.35}>
                  <Screen
                    src={SCREENS.tableauDeBord}
                    path="espace"
                    preload
                    alt="Espace agence Dahoo : le tableau de bord, avec les loyers encaissés du mois, le recouvrement, les impayés et l'occupation"
                    sizes="(min-width: 992px) 45vw, 90vw"
                  />
                </Reveal>
              </Parallax>
            </div>

            <div className="absolute right-0 bottom-0 w-[54%] sm:w-[46%]">
              <Parallax distance={60}>
                <Reveal delay={0.6}>
                  <Screen
                    src={SCREENS.paiements}
                    path="espace/paiements"
                    crop="content"
                    alt=""
                    sizes="(min-width: 992px) 26vw, 54vw"
                    className="-rotate-2"
                  />
                </Reveal>
              </Parallax>
            </div>

            <Reveal delay={0.85} className="absolute bottom-[3%] left-[2%] hidden sm:block">
              <PaymentPills />
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
