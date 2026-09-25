import { IconArrowRight } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

import { Container, Section } from "@/components/site/layout";
import { Highlight, Parallax, Reveal } from "@/components/site/motion";
import { SectionHeading } from "@/components/site/SectionHeading";

const MODULES = ["Biens et lots", "Baux et locataires", "Échéances", "Paiements", "Maintenance", "Annonces"];

const PAYMENTS = [
  { src: "/images/site/logos/wave.png", name: "Wave" },
  { src: "/images/site/logos/orange-money.png", name: "Orange Money" },
];

/**
 * Bloc « Vous êtes une agence ? » : après l'immobilier, le logiciel. On montre de vraies captures de
 * l'espace agence (données de démonstration) plutôt que de décrire les fonctions.
 */
export function AgencyCta() {
  return (
    <Section tone="brand" labelledBy="accueil-agences" className="overflow-hidden">
      <Container className="grid items-center gap-14 lg:grid-cols-12 lg:gap-8">
        <Reveal className="flex flex-col gap-8 lg:col-span-5">
          <SectionHeading
            id="accueil-agences"
            index="05"
            eyebrow="Vous êtes une agence immobilière ?"
            title={
              <>
                Gérez toute votre agence avec <Highlight>Dahoo</Highlight>
              </>
            }
          >
            <p className="m-0">Vos biens, vos baux et vos loyers dans un seul outil, et vos annonces publiées ici en un clic.</p>
          </SectionHeading>

          <ul className="m-0 flex list-none flex-wrap gap-2 p-0" aria-label="Modules du logiciel">
            {MODULES.map((module) => (
              <li key={module} className="border-border-strong text-text-strong rounded-full border px-3.5 py-1.5 text-sm">
                {module}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="site-label text-text-muted m-0">Paiements enregistrés</p>
            <ul className="m-0 flex list-none flex-wrap items-center gap-2 p-0">
              {PAYMENTS.map((payment) => (
                <li key={payment.name} className="flex items-center gap-2 rounded-full bg-white py-1 pr-3.5 pl-1">
                  <Image src={payment.src} alt="" width={28} height={28} className="size-7 rounded-full object-cover" />
                  <span className="text-brand-900 text-sm font-medium whitespace-nowrap">{payment.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link href="/pour-les-agences#demo" className="ax-btn ax-btn--primary ax-btn--lg">
              <span className="ax-btn__label">Demander une démo</span>
            </Link>
            <Link href="/pour-les-agences" className="site-link text-text-strong inline-flex items-center gap-2 font-medium">
              Découvrir le logiciel <IconArrowRight size={18} stroke={1.75} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>

        {/* Captures réelles, en profondeur : la seconde glisse plus vite que la première. */}
        <div className="relative lg:col-span-7">
          <Parallax distance={24}>
            <div className="border-border-strong overflow-hidden rounded-lg border shadow-[0_40px_80px_-30px_rgba(0,0,0,0.55)] lg:mr-16">
              <Image
                src="/images/site/app/tableau-de-bord.webp"
                alt="Espace agence Dahoo : le tableau de bord, avec les loyers encaissés du mois, le recouvrement, les impayés et l'occupation"
                width={2880}
                height={1800}
                sizes="(min-width: 992px) 55vw, 100vw"
                className="block h-auto w-full"
              />
            </div>
          </Parallax>
          <Parallax distance={70} className="absolute -bottom-10 -left-4 w-[58%] sm:-left-8 lg:-bottom-16 lg:-left-12">
            <div className="border-border-strong overflow-hidden rounded-lg border shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]">
              <Image
                src="/images/site/app/annonces.webp"
                alt="Espace agence Dahoo : la liste des annonces publiées sur le portail, avec leurs photos"
                width={2880}
                height={1800}
                sizes="(min-width: 992px) 32vw, 58vw"
                className="block h-auto w-full"
              />
            </div>
          </Parallax>
        </div>
      </Container>
    </Section>
  );
}
