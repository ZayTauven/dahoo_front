import { IconCheck, IconGift } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Container, Section } from "@/components/site/layout";
import { Highlight, Reveal } from "@/components/site/motion";
import { SectionHeading } from "@/components/site/SectionHeading";
import { publicApi } from "@/lib/api/server";
import { cn } from "@/lib/utils";

import { PageBanner } from "../agences/_components/PageBanner";
import { Faq, type FaqItem } from "../pour-les-agences/_components/Faq";
import { LIMITS, limitLabel, limitShort, planPrice, type Plan } from "./_components/plans";

export const metadata: Metadata = {
  title: "Tarifs",
  description:
    "Essayez Dahoo gratuitement pendant 30 jours, puis choisissez l'offre adaptée à la taille de votre agence. Toutes les offres incluent tous les modules.",
  alternates: { canonical: "/tarifs" },
};

/** Modules inclus dans toutes les offres (seules les limites changent d'une offre à l'autre). */
const FEATURES = [
  "Biens, bâtiments et lots, avec leur statut d'occupation",
  "Annuaire des locataires et baux (brouillon, actif, résilié, terminé)",
  "Échéances et paiements (Wave, Orange Money, espèces, virement)",
  "Tickets de maintenance, affectation et journal d'intervention",
  "Annonces publiées sur le portail Dahoo, avec photos",
  "Demandes de visite reçues dans l'espace agence",
  "Équipe avec rôles : administrateur, gestionnaire, comptable, lecture seule",
  "Données cloisonnées par agence",
];

const FAQ: FaqItem[] = [
  {
    question: "Que se passe-t-il à la fin des 30 jours d'essai ?",
    answer: (
      <p className="m-0">
        Si aucun abonnement n&apos;est activé, votre espace passe en lecture seule : vos données restent consultables,
        mais les modifications sont bloquées jusqu&apos;à l&apos;activation d&apos;une offre. Rien n&apos;est supprimé.
      </p>
    ),
  },
  {
    question: "Faut-il une carte bancaire pour commencer l'essai ?",
    answer: (
      <p className="m-0">
        Non. L&apos;essai démarre à la création de votre espace par l&apos;équipe Dahoo, après votre demande de
        démonstration.
      </p>
    ),
  },
  {
    question: "Comment se règle l'abonnement ?",
    answer: (
      <p className="m-0">
        Les modalités de paiement (Mobile Money, virement) sont convenues avec l&apos;équipe Dahoo lors de l&apos;activation
        de votre abonnement.
      </p>
    ),
  },
  {
    question: "Puis-je changer d'offre ?",
    answer: (
      <p className="m-0">
        Oui. Si votre parc grandit, l&apos;équipe Dahoo fait évoluer votre offre ; vos données et vos réglages sont
        conservés.
      </p>
    ),
  },
];

async function getPlans(): Promise<Plan[] | null> {
  try {
    const { data } = await publicApi.GET("/api/v1/public/plans/");
    return data ?? null;
  } catch {
    return null;
  }
}

export default async function PricingPage() {
  const plans = await getPlans();

  return (
    <>
      <PageBanner
        eyebrow="Tarifs"
        title="Une offre simple, adaptée à la taille de votre agence"
        lede="Tous les modules sont inclus dans chaque offre : seules les limites de biens, de lots et d'utilisateurs changent."
        crumbs={[{ label: "Tarifs" }]}
        image="/images/site/immobilier-02.webp"
        watermark="tarifs"
      />

      <Section labelledBy="essai-titre">
        <Container>
          <Reveal className="border-accent/40 bg-accent-wash flex flex-col items-start gap-5 rounded-xl border p-8 md:flex-row md:items-center">
            <span className="bg-accent text-on-accent flex size-14 shrink-0 items-center justify-center rounded-full">
              <IconGift size={28} stroke={1.75} aria-hidden="true" />
            </span>
            <div className="flex-1">
              <h2 id="essai-titre" className="font-display text-text-strong m-0 text-2xl font-semibold">
                30 jours d&apos;essai gratuit, toutes fonctionnalités
              </h2>
              <p className="text-text-muted m-0 mt-2">
                Testez Dahoo avec vos vrais biens et votre équipe avant de choisir une offre. Sans engagement.
              </p>
            </div>
            <Link href="/pour-les-agences#demo" className="ax-btn ax-btn--primary ax-btn--lg">
              <span className="ax-btn__label">Demander une démo</span>
            </Link>
          </Reveal>
        </Container>
      </Section>

      <Section tone="subtle" labelledBy="offres-titre">
        <Container className="flex flex-col gap-12">
          <SectionHeading
            id="offres-titre"
            align="center"
            eyebrow="Offres"
            title={
              <>
                Choisissez votre <Highlight>offre</Highlight>
              </>
            }
          />

          {plans && plans.length > 0 ? (
            <ul className="m-0 grid list-none gap-6 p-0 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan, index) => {
                const price = planPrice(plan);
                const featured = plans.length > 1 && index === 1;
                return (
                  <Reveal as="li" key={plan.id} delay={index * 0.08}>
                    <article
                      className={cn(
                        "bg-surface-solid flex h-full flex-col gap-6 rounded-xl border p-8",
                        featured ? "border-accent shadow-[0_24px_48px_-28px_rgba(20,27,71,0.45)]" : "border-border-default",
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-display text-text-strong m-0 text-xl font-semibold">{plan.name}</h3>
                        {featured && <span className="bg-accent text-on-accent rounded-full px-3 py-1 text-xs font-bold">Populaire</span>}
                      </div>
                      <p className="m-0">
                        <span className="font-display text-text-strong text-4xl font-bold">{price.amount}</span>
                        {price.unit && <span className="text-text-muted ml-1">{price.unit}</span>}
                        {price.note && <span className="text-text-subtle mt-1 block text-sm">{price.note}</span>}
                      </p>
                      <ul className="m-0 flex list-none flex-col gap-2 p-0">
                        {LIMITS.map((limit) => (
                          <li key={limit.key} className="text-text flex items-center gap-2">
                            <IconCheck size={18} stroke={2} className="text-accent-text shrink-0" aria-hidden="true" />
                            {limitLabel(plan[limit.key], limit)}
                          </li>
                        ))}
                        <li className="text-text flex items-center gap-2">
                          <IconCheck size={18} stroke={2} className="text-accent-text shrink-0" aria-hidden="true" />
                          Tous les modules inclus
                        </li>
                      </ul>
                      <Link
                        href="/pour-les-agences#demo"
                        className={cn("ax-btn ax-btn--block mt-auto", featured ? "ax-btn--primary" : "ax-btn--secondary")}
                      >
                        <span className="ax-btn__label">Commencer l&apos;essai</span>
                      </Link>
                    </article>
                  </Reveal>
                );
              })}
            </ul>
          ) : (
            <Reveal className="bg-surface-solid border-border-default mx-auto flex max-w-2xl flex-col items-center gap-4 rounded-xl border p-10 text-center">
              <h3 className="font-display text-text-strong m-0 text-2xl font-semibold">Tarifs sur mesure</h3>
              <p className="text-text-muted m-0">
                Nos offres sont établies selon la taille de votre parc. Décrivez votre agence : nous vous proposons un tarif
                adapté après la démonstration.
              </p>
              <Link href="/pour-les-agences#demo" className="ax-btn ax-btn--primary">
                <span className="ax-btn__label">Demander une démo</span>
              </Link>
            </Reveal>
          )}

          {plans && plans.length > 1 && (
            <div className="ax-table-wrap">
              <table className="ax-table">
                <caption className="sr-only">Comparaison des limites de chaque offre</caption>
                <thead className="ax-table__head">
                  <tr>
                    <th scope="col" className="ax-table__th">
                      Limite
                    </th>
                    {plans.map((plan) => (
                      <th key={plan.id} scope="col" className="ax-table__th ax-table__th--num">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {LIMITS.map((limit) => (
                    <tr key={limit.key} className="ax-table__row">
                      <th scope="row" className="ax-table__td text-left font-medium">
                        {limit.label}
                      </th>
                      {plans.map((plan) => (
                        <td key={plan.id} className="ax-table__td ax-table__td--num">
                          {limitShort(plan[limit.key])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Container>
      </Section>

      <Section labelledBy="inclus-titre">
        <Container className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <SectionHeading
            id="inclus-titre"
            eyebrow="Inclus dans toutes les offres"
            title={
              <>
                Tout ce qu&apos;il faut pour <Highlight>gérer</Highlight> votre agence
              </>
            }
          >
            <p className="m-0">
              Pas de module payant en option : chaque agence dispose de l&apos;ensemble du logiciel, quelle que soit son
              offre.
            </p>
          </SectionHeading>
          <ul className="m-0 grid list-none gap-3 p-0">
            {FEATURES.map((feature) => (
              <li key={feature} className="text-text flex items-start gap-3">
                <IconCheck size={20} stroke={2} className="text-accent-text mt-0.5 shrink-0" aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="subtle" labelledBy="faq-tarifs-titre">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <SectionHeading id="faq-tarifs-titre" eyebrow="Questions fréquentes" title="Tarifs et abonnement" />
          <Faq items={FAQ} name="faq-tarifs" />
        </Container>
      </Section>
    </>
  );
}
