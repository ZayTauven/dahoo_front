import {
  IconArrowRight,
  IconBuildingCommunity,
  IconFileCertificate,
  IconReportMoney,
  IconTools,
  IconWorldUpload,
  type Icon,
} from "@tabler/icons-react";
import Link from "next/link";

import { Container, Section } from "@/components/site/layout";
import { Highlight, Reveal } from "@/components/site/motion";
import { SectionHeading } from "@/components/site/SectionHeading";

const FEATURES: { icon: Icon; title: string; text: string }[] = [
  {
    icon: IconBuildingCommunity,
    title: "Biens et lots",
    text: "Immeubles, appartements, locaux : tout votre parc au même endroit.",
  },
  {
    icon: IconFileCertificate,
    title: "Baux et locataires",
    text: "Contrats, dossiers et échéances de fin de bail suivis sans tableur.",
  },
  {
    icon: IconReportMoney,
    title: "Loyers encaissés",
    text: "Échéances suivies, paiements saisis, impayés repérés tout de suite.",
  },
  {
    icon: IconTools,
    title: "Maintenance",
    text: "Demandes d'intervention suivies du signalement à la clôture.",
  },
  {
    icon: IconWorldUpload,
    title: "Annonces publiées ici",
    text: "Vos biens libres apparaissent sur ce portail en un clic.",
  },
];

/** Bloc « Vous êtes une agence ? » : le logiciel Dahoo, sur fond indigo. */
export function AgencyCta() {
  return (
    <Section tone="brand" labelledBy="accueil-agences" className="overflow-hidden">
      <Container className="grid items-center gap-12 lg:grid-cols-[5fr_7fr] lg:gap-16">
        <Reveal className="flex flex-col gap-8">
          <SectionHeading
            id="accueil-agences"
            invert
            eyebrow="Vous êtes une agence immobilière ?"
            title={
              <>
                Gérez toute votre agence avec <Highlight>Dahoo</Highlight>
              </>
            }
          >
            <p className="m-0">
              Le logiciel de gestion locative pensé pour les agences au Sénégal : vos biens, vos baux, vos loyers et
              vos interventions dans un seul outil, et vos annonces publiées sur le portail en quelques clics.
            </p>
          </SectionHeading>

          <div className="flex flex-wrap gap-3">
            <Link href="/pour-les-agences#demo" className="ax-btn ax-btn--primary ax-btn--lg">
              <span className="ax-btn__label">Demander une démo</span>
            </Link>
            <Link
              href="/tarifs"
              className="ax-btn ax-btn--lg border border-white/40 bg-transparent text-white hover:bg-white/10"
            >
              <span className="ax-btn__label">Voir les tarifs</span>
              <IconArrowRight className="ax-btn__icon" stroke={2} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>

        <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, text }, index) => (
            <Reveal
              as="li"
              key={title}
              delay={index * 0.06}
              className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-5 sm:last:col-span-2"
            >
              <span className="bg-accent text-on-accent flex size-11 shrink-0 items-center justify-center rounded-lg">
                <Icon size={22} stroke={1.75} aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="font-display m-0 text-base font-semibold text-white">{title}</h3>
                <p className="m-0 text-sm leading-relaxed text-white/75">{text}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
