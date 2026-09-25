import { IconArrowRight } from "@tabler/icons-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Container, Section } from "@/components/site/layout";
import { Highlight, Parallax, Reveal, RevealImage } from "@/components/site/motion";
import { PHOTOS } from "@/components/site/photos";
import { Eyebrow, SectionHeading } from "@/components/site/SectionHeading";
import { publicApi } from "@/lib/api/server";
import type { Schema } from "@/lib/api/types";
import { formatNumber } from "@/lib/format";

import { Comparison } from "./_components/Comparison";
import { DemoForm } from "./_components/DemoForm";
import { Facts } from "./_components/Facts";
import { Faq, type FaqItem } from "./_components/Faq";
import { Hero } from "./_components/Hero";
import { Security } from "./_components/Security";
import { Steps } from "./_components/Steps";
import { Tour } from "./_components/Tour";

export const metadata: Metadata = {
  title: "Logiciel de gestion locative pour agences immobilières",
  description:
    "Dahoo aide les agences immobilières du Sénégal à gérer biens, locataires, baux, loyers (Wave, Orange Money, espèces), maintenance et annonces, en équipe. 30 jours d'essai gratuit, démo sur demande.",
  alternates: { canonical: "/pour-les-agences" },
  openGraph: {
    type: "website",
    locale: "fr_SN",
    siteName: "Dahoo",
    url: "/pour-les-agences",
    title: "Dahoo pour les agences immobilières",
    description:
      "Patrimoine, baux, loyers, maintenance et annonces réunis dans un seul espace pour toute votre agence. Demandez une démo.",
  },
};

/** Compteurs réels du portail ; `null` si l'API ne répond pas (les chiffres sont alors masqués). */
async function getStats(): Promise<Schema<"PublicStats"> | null> {
  try {
    const { data } = await publicApi.GET("/api/v1/public/stats/");
    return data ?? null;
  } catch {
    return null;
  }
}

/** « 19 annonces en ligne · 6 agences » : affiché sur la capture des annonces, s'il y a des chiffres. */
function portalFigures(stats: Schema<"PublicStats"> | null): string | undefined {
  if (!stats) return undefined;
  const parts = [
    stats.listings_count > 0 &&
      `${formatNumber(stats.listings_count)} ${stats.listings_count > 1 ? "annonces en ligne" : "annonce en ligne"}`,
    stats.agencies_count > 0 &&
      `${formatNumber(stats.agencies_count)} ${stats.agencies_count > 1 ? "agences" : "agence"} sur le portail`,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

const FAQ: FaqItem[] = [
  {
    question: "Faut-il installer un logiciel ?",
    answer: (
      <p className="m-0">
        Non. Dahoo s&apos;utilise dans le navigateur, sur ordinateur, tablette ou téléphone, avec une connexion internet. Il n&apos;y a
        pas d&apos;application à télécharger.
      </p>
    ),
  },
  {
    question: "Dahoo encaisse-t-il les loyers à ma place ?",
    answer: (
      <p className="m-0">
        Non. Vos locataires paient comme aujourd&apos;hui (Wave, Orange Money, virement, espèces) et l&apos;argent arrive sur vos
        comptes. Dahoo sert à <b className="text-text-strong">enregistrer</b> chaque paiement reçu avec sa référence et à l&apos;affecter
        aux bonnes échéances.
      </p>
    ),
  },
  {
    question: "Je gère des biens pour le compte de propriétaires : est-ce adapté ?",
    answer: (
      <p className="m-0">
        Oui. Chaque bien peut être rattaché à son propriétaire (bailleur), et vous organisez ensuite ses bâtiments, ses lots, ses
        baux et ses paiements.
      </p>
    ),
  },
  {
    question: "Que se passe-t-il à la fin des 30 jours d'essai ?",
    answer: (
      <p className="m-0">
        Sans abonnement, votre espace passe en lecture seule : vos données restent consultables, mais plus rien ne peut être
        ajouté ni modifié, et vos annonces ne sont plus affichées sur le portail. L&apos;activation d&apos;un abonnement rétablit
        l&apos;accès complet. Voir <Link href="/tarifs">les tarifs</Link>.
      </p>
    ),
  },
  {
    question: "Mes collaborateurs voient-ils tout ?",
    answer: (
      <p className="m-0">
        Cela dépend du rôle que vous leur donnez : administrateur, gestionnaire, comptable ou lecture seule. Un comptable peut par
        exemple enregistrer les paiements sans pouvoir modifier les baux.
      </p>
    ),
  },
  {
    question: "Comment démarrer ?",
    answer: (
      <p className="m-0">
        Demandez une démo avec le <a href="#demo">formulaire ci-dessous</a>. L&apos;équipe Dahoo vous rappelle, crée votre espace agence
        et votre compte administrateur : l&apos;essai gratuit de 30 jours démarre à ce moment-là.
      </p>
    ),
  },
];

/** Questions fréquentes à côté d'une photo (d'après les « FAQ Sections » de 21st). */
function Questions() {
  return (
    <Section labelledBy="faq-titre">
      <Container className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <div className="flex flex-col gap-4 lg:sticky lg:top-28">
            <RevealImage className="aspect-2/1 rounded-md sm:aspect-video lg:aspect-4/5">
              <Parallax distance={40} className="absolute -inset-y-12 inset-x-0">
                <Image
                  src={PHOTOS.immeublePlateau.src}
                  alt={PHOTOS.immeublePlateau.alt}
                  fill
                  sizes="(min-width: 992px) 38vw, 100vw"
                  className="object-cover object-[center_75%]"
                />
              </Parallax>
            </RevealImage>
            <Link href="/contact" className="site-link text-text-strong inline-flex items-center gap-2 self-start font-medium">
              Une autre question ? Écrivez-nous <IconArrowRight size={18} stroke={1.75} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-8 lg:col-span-7">
          <SectionHeading
            id="faq-titre"
            index="05"
            eyebrow="Questions fréquentes"
            title={
              <>
                Vous avez une <Highlight>question ?</Highlight>
              </>
            }
          />
          <Reveal delay={0.1}>
            <Faq items={FAQ} name="faq-agences" />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

/**
 * Demande de démo en deux colonnes (d'après le « Contact 01 » de 21st) : à gauche la promesse et
 * les quatre étapes reliées par leur tracé, à droite le formulaire (sur mobile, le formulaire vient
 * juste après le titre).
 */
function DemoSection() {
  return (
    <Section tone="subtle" id="demo" labelledBy="demo-titre" className="scroll-mt-16">
      <Container className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="flex flex-col gap-10 lg:col-span-5">
          <SectionHeading
            id="demo-titre"
            index="06"
            eyebrow="Démonstration"
            title={
              <>
                Voyez Dahoo avec <Highlight>vos propres cas</Highlight>
              </>
            }
          >
            <p className="m-0">Dites-nous qui vous êtes et combien de lots vous gérez : la démo sera adaptée à votre agence.</p>
          </SectionHeading>
          <div className="hidden flex-col gap-6 lg:flex">
            <Eyebrow as="p">Ce qui se passe ensuite</Eyebrow>
            <Steps />
          </div>
        </div>

        <div className="bg-surface-solid border-border-default self-start rounded-md border lg:col-span-7">
          <DemoForm />
        </div>

        <div className="flex flex-col gap-6 lg:hidden">
          <Eyebrow as="p">Ce qui se passe ensuite</Eyebrow>
          <Steps />
        </div>
      </Container>
    </Section>
  );
}

export default async function ForAgenciesPage() {
  const stats = await getStats();
  return (
    <>
      <Hero />
      <Comparison />
      <Tour portalFigures={portalFigures(stats)} />
      <Facts />
      <Security />
      <Questions />
      <DemoSection />
    </>
  );
}
