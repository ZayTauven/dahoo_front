import { IconArrowRight, IconCheck, IconLock } from "@tabler/icons-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Container, Section } from "@/components/site/layout";
import { Highlight, Reveal } from "@/components/site/motion";
import { PageHero } from "@/components/site/PageHero";
import { PHOTOS } from "@/components/site/photos";
import { Eyebrow, SectionHeading } from "@/components/site/SectionHeading";
import { publicApi } from "@/lib/api/server";
import { cn } from "@/lib/utils";

import { Faq, type FaqItem } from "../pour-les-agences/_components/Faq";
import { DEMO_HREF, ROLES, SCREENS } from "../pour-les-agences/_components/offer";
import { PaymentPills, Screen } from "../pour-les-agences/_components/Screen";
import { LIMITS, limitLabel, limitShort, planPrice, type Plan } from "./_components/plans";

export const metadata: Metadata = {
  title: "Tarifs",
  description:
    "Essayez Dahoo gratuitement pendant 30 jours, puis choisissez l'offre adaptée à la taille de votre agence. Toutes les offres incluent tous les modules.",
  alternates: { canonical: "/tarifs" },
};

/** Modules inclus dans toutes les offres (seules les limites changent d'une offre à l'autre), en pastilles. */
const FEATURES = [
  "Biens, bâtiments et lots",
  "Locataires et baux",
  "Échéances",
  "Paiements",
  "Maintenance",
  "Annonces et demandes de visite",
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

/** L'offre du milieu est recommandée dès qu'il y a au moins deux offres. */
const isFeatured = (plans: Plan[], index: number) => plans.length > 1 && index === 1;

/** Colonne d'encre : l'offre recommandée, ou l'offre unique quand il n'y en a qu'une (sans l'étiquette). */
const isHighlighted = (plans: Plan[], index: number) => plans.length === 1 || isFeatured(plans, index);

/* ------------------------------------------------------------------ offres */

function PriceBlock({ plan, large = false }: { plan: Plan; large?: boolean }) {
  const price = planPrice(plan);
  return (
    <div className="flex flex-col gap-2">
      <p className="m-0 flex flex-wrap items-baseline gap-x-2">
        <span className={cn("font-display text-text-strong leading-none tracking-[-0.03em]", large ? "text-6xl lg:text-7xl" : "text-5xl")}>
          {price.amount}
        </span>
        {price.unit && <span className="text-text-muted">{price.unit}</span>}
      </p>
      {price.note && <p className="text-text-muted m-0 text-sm">{price.note}</p>}
    </div>
  );
}

function FeaturedLabel() {
  return (
    <span className="site-label text-text-muted flex items-center gap-2">
      <span aria-hidden="true" className="bg-accent size-1.5 rounded-full" />
      Recommandée
    </span>
  );
}

/**
 * Offres en tableau éditorial (tablette et bureau) : une colonne par offre, filets fins, l'offre
 * recommandée en colonne d'encre. Sur téléphone, les mêmes offres empilées, une par bloc.
 */
function PlansTable({ plans }: { plans: Plan[] }) {
  const cell = (index: number, extra?: string) =>
    cn("px-6 align-top lg:px-8", isHighlighted(plans, index) && "site-dark", extra);

  return (
    <>
      <Reveal className="hidden md:block">
        <table className="w-full table-fixed border-collapse text-left">
          <caption className="sr-only">Offres Dahoo : prix et limites de chaque offre</caption>
          <colgroup>
            <col className={plans.length > 2 ? "w-[22%]" : "w-[34%]"} />
            {plans.map((plan) => (
              <col key={plan.id} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className="site-label text-text-muted pt-8 pb-10 align-bottom font-medium">
                Offre
              </th>
              {plans.map((plan, index) => (
                <th key={plan.id} scope="col" className={cell(index, "rounded-t-md pt-8 pb-10 align-bottom font-normal")}>
                  <span className="flex flex-col gap-3">
                    {isFeatured(plans, index) && <FeaturedLabel />}
                    <span className="font-display text-text-strong text-4xl leading-none tracking-tight lg:text-5xl">{plan.name}</span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-text-strong border-t">
              <th scope="row" className="site-label text-text-muted py-8 align-top font-medium">
                Prix
              </th>
              {plans.map((plan, index) => (
                <td key={plan.id} className={cell(index, "py-8")}>
                  <PriceBlock plan={plan} large={plans.length === 1} />
                </td>
              ))}
            </tr>
            {LIMITS.map((limit) => (
              <tr key={limit.key} className="border-border-default border-t">
                <th scope="row" className="site-label text-text-muted py-6 align-baseline font-medium">
                  {limit.label}
                </th>
                {plans.map((plan, index) => (
                  <td key={plan.id} className={cell(index, "py-6 align-baseline")}>
                    <span className="font-display text-text-strong text-3xl leading-none tracking-tight">
                      {/* Colonnes larges (une ou deux offres) : la limite en toutes lettres. */}
                      {plans.length > 2 ? limitShort(plan[limit.key]) : limitLabel(plan[limit.key], limit)}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-border-default border-t">
              <th scope="row" className="site-label text-text-muted py-6 align-baseline font-medium">
                Modules
              </th>
              {plans.map((plan, index) => (
                <td key={plan.id} className={cell(index, "py-6 align-baseline")}>
                  <span className="font-display text-text-strong text-3xl leading-none tracking-tight">Tous inclus</span>
                </td>
              ))}
            </tr>
            <tr className="border-border-default border-t">
              <td className="py-8" />
              {plans.map((plan, index) => (
                <td key={plan.id} className={cell(index, "rounded-b-md py-8")}>
                  <Link
                    href={DEMO_HREF}
                    className={cn("ax-btn ax-btn--lg", isHighlighted(plans, index) ? "ax-btn--primary" : "ax-btn--secondary")}
                    aria-label={`Commencer l'essai, offre ${plan.name}`}
                  >
                    <span className="ax-btn__label">Commencer l&apos;essai</span>
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </Reveal>

      <ul className="m-0 flex list-none flex-col gap-6 p-0 md:hidden">
        {plans.map((plan, index) => {
          const featured = isFeatured(plans, index);
          const highlighted = isHighlighted(plans, index);
          return (
            <Reveal as="li" key={plan.id} className={cn(highlighted ? "site-dark rounded-md px-5 py-8" : "border-text-strong border-t pt-8")}>
              <article className="flex flex-col gap-8">
                <header className="flex flex-col gap-3">
                  {featured && <FeaturedLabel />}
                  <h3 className="font-display text-text-strong m-0 text-4xl leading-none font-normal tracking-tight">{plan.name}</h3>
                </header>
                <PriceBlock plan={plan} />
                <ul className="m-0 list-none p-0">
                  {LIMITS.map((limit) => (
                    <li key={limit.key} className="border-border-default text-text-strong border-t py-3">
                      {limitLabel(plan[limit.key], limit)}
                    </li>
                  ))}
                  <li className="border-border-default text-text-strong border-y py-3">Tous les modules inclus</li>
                </ul>
                <Link
                  href={DEMO_HREF}
                  className={cn("ax-btn ax-btn--lg ax-btn--block", highlighted ? "ax-btn--primary" : "ax-btn--secondary")}
                  aria-label={`Commencer l'essai, offre ${plan.name}`}
                >
                  <span className="ax-btn__label">Commencer l&apos;essai</span>
                </Link>
              </article>
            </Reveal>
          );
        })}
      </ul>
    </>
  );
}

/** Offre unique : une carte d'encre (prix et limites en grand), à côté de l'essai gratuit. */
function PlanSpotlight({ plan }: { plan: Plan }) {
  return (
    <Reveal className="site-dark flex flex-col gap-8 rounded-md p-6 sm:p-10 lg:col-span-7">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <p className="site-label text-text-muted m-0">Offre</p>
          <h3 className="font-display text-text-strong m-0 text-5xl leading-none font-normal tracking-tight sm:text-6xl">{plan.name}</h3>
        </div>
        <PriceBlock plan={plan} large />
      </div>
      <dl className="border-border-default m-0 grid grid-cols-3 gap-4 border-t pt-6">
        {LIMITS.map((limit) => (
          <div key={limit.key} className="flex flex-col gap-1">
            <dt className="site-label text-text-muted order-2">{limit.label}</dt>
            <dd className="font-display text-text-strong order-1 m-0 text-4xl leading-none tracking-tight sm:text-5xl">
              {limitShort(plan[limit.key])}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-8 gap-y-5">
        <p className="text-text-strong m-0 flex items-center gap-2">
          <IconCheck size={18} stroke={2} aria-hidden="true" className="text-accent-text" />
          Tous les modules inclus
        </p>
        <Link href={DEMO_HREF} className="ax-btn ax-btn--primary ax-btn--lg" aria-label={`Commencer l'essai, offre ${plan.name}`}>
          <span className="ax-btn__label">Commencer l&apos;essai</span>
        </Link>
      </div>
    </Reveal>
  );
}

/** Aucune offre publiée (ou API indisponible) : tarif établi après la démonstration. */
function CustomPricing() {
  return (
    <Reveal className="bg-surface-solid flex flex-col justify-between gap-10 rounded-md p-6 sm:p-10 lg:col-span-7">
      <h3 className="font-display text-text-strong m-0 text-6xl leading-[0.95] font-normal tracking-[-0.03em] sm:text-7xl">
        Tarifs <Highlight>sur mesure</Highlight>
      </h3>
      <div className="flex flex-col items-start gap-6">
        <p className="text-text-muted m-0 max-w-md leading-relaxed">
          Nos offres sont établies selon la taille de votre parc : nous vous proposons un tarif adapté après la démonstration.
        </p>
        <Link href={DEMO_HREF} className="ax-btn ax-btn--primary ax-btn--lg">
          <span className="ax-btn__label">Demander une démo</span>
        </Link>
      </div>
    </Reveal>
  );
}

/** L'essai gratuit, en tuile orange (d'après le « Stats Bento » de 21st). */
function TrialTile({ className, wide = false }: { className?: string; wide?: boolean }) {
  return (
    <Reveal
      delay={0.08}
      className={cn(
        "bg-accent text-on-accent relative flex flex-col justify-between gap-8 overflow-hidden rounded-md p-6 sm:p-10",
        wide && "md:flex-row md:items-end",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(45deg,var(--ax-on-accent)_0px_1px,transparent_1px_10px)] opacity-15 [mask-image:radial-gradient(ellipse_80%_60%_at_100%_0%,#000_60%,transparent_100%)]"
      />
      <div className="relative flex flex-col gap-6">
        <h3 className="site-label m-0 font-medium opacity-85">Essai gratuit</h3>
        <p className="m-0 flex flex-wrap items-end gap-x-4 gap-y-2">
          <span className="font-display text-[7rem] leading-[0.8] tracking-[-0.05em] sm:text-[9rem]">30</span>
          <span className="font-display pb-2 text-3xl leading-[1.05] tracking-tight sm:text-4xl">
            jours, toutes
            <br />
            <Highlight>fonctionnalités</Highlight>
          </span>
        </p>
      </div>
      <ul aria-label="Conditions de l'essai" className="relative m-0 flex list-none flex-wrap gap-2 p-0">
        {["Sans engagement", "Sans carte bancaire", "Données conservées"].map((item) => (
          <li key={item} className="border-on-accent/30 rounded-full border px-3.5 py-1.5 text-sm font-medium">
            {item}
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ page */

export default async function PricingPage() {
  const plans = await getPlans();

  return (
    <>
      <PageHero
        crumbs={[{ label: "Tarifs" }]}
        eyebrow="Tarifs"
        title={
          <>
            Une offre simple, à la taille de <Highlight>votre agence</Highlight>
          </>
        }
        lede="Tous les modules dans chaque offre : seules les limites de biens, de lots et d'utilisateurs changent."
      >
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link href={DEMO_HREF} className="ax-btn ax-btn--primary ax-btn--lg">
            <span className="ax-btn__label">Demander une démo</span>
          </Link>
          <Link href="/pour-les-agences" className="site-link text-text-strong inline-flex items-center gap-2 font-medium">
            Découvrir le logiciel <IconArrowRight size={18} stroke={1.75} aria-hidden="true" />
          </Link>
        </div>
      </PageHero>

      <Section tone="subtle" labelledBy="offres-titre">
        <Container className="flex flex-col gap-10 lg:gap-12">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              id="offres-titre"
              index="01"
              eyebrow="Offres"
              title={
                <>
                  Choisissez votre <Highlight>offre</Highlight>
                </>
              }
            />
            <p className="site-label text-text-muted m-0 lg:pb-3">L&apos;essai d&apos;abord, l&apos;offre ensuite</p>
          </div>

          {plans && plans.length > 1 ? (
            <>
              <PlansTable plans={plans} />
              <TrialTile wide />
            </>
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
              {plans && plans.length === 1 ? <PlanSpotlight plan={plans[0]} /> : <CustomPricing />}
              <TrialTile className="lg:col-span-5" />
            </div>
          )}
        </Container>
      </Section>

      <Section labelledBy="inclus-titre">
        <Container>
          <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-6 md:grid-rows-[repeat(2,minmax(15rem,auto))]">
            <Reveal as="li" className="relative isolate min-h-80 overflow-hidden rounded-md md:col-span-2 md:row-span-2">
              <Image
                src={PHOTOS.villaPatioBleu.src}
                alt={PHOTOS.villaPatioBleu.alt}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="-z-10 object-cover"
              />
              <span aria-hidden="true" className="from-brand-900/85 via-brand-900/25 absolute inset-0 -z-10 bg-linear-to-t to-transparent" />
              <div className="flex h-full flex-col justify-end gap-4 p-6 sm:p-8">
                <Eyebrow index="02" className="text-white/75 [&>span:first-child]:text-white">
                  Inclus dans toutes les offres
                </Eyebrow>
                <h2 id="inclus-titre" className="font-display m-0 text-4xl leading-none font-normal tracking-tight text-balance text-white sm:text-5xl">
                  Tout le logiciel, <Highlight>sans option</Highlight>
                </h2>
              </div>
            </Reveal>

            <Reveal as="li" delay={0.06} className="bg-surface-solid relative flex flex-col gap-5 overflow-hidden rounded-md p-6 sm:p-8 md:col-span-4">
              <p className="text-text-strong m-0 flex items-end gap-3">
                <span className="font-display text-7xl leading-[0.85] tracking-[-0.04em]">6</span>
                <span className="text-text-muted pb-1">modules reliés</span>
              </p>
              <ul aria-label="Modules inclus" className="relative z-10 m-0 flex list-none flex-wrap gap-2 p-0 sm:max-w-[55%]">
                {FEATURES.map((feature) => (
                  <li key={feature} className="border-border-strong text-text-strong bg-surface-solid rounded-full border px-3.5 py-1.5 text-sm">
                    {feature}
                  </li>
                ))}
              </ul>
              <div aria-hidden="true" className="-mr-10 -mb-16 ml-auto w-[90%] -rotate-2 sm:absolute sm:right-0 sm:-bottom-8 sm:m-0 sm:w-[44%] sm:translate-x-4">
                <Screen src={SCREENS.echeances} path="espace/echeances" crop="content" alt="" sizes="(min-width: 768px) 30vw, 90vw" />
              </div>
            </Reveal>

            <Reveal as="li" delay={0.12} className="site-dark flex flex-col justify-between gap-6 rounded-md p-6 sm:p-8 md:col-span-2">
              <p className="site-label text-text-muted m-0">Paiements enregistrés</p>
              <PaymentPills withOthers />
              <p className="text-text-strong m-0 leading-snug">Chaque loyer reçu, avec sa référence, affecté à ses échéances.</p>
            </Reveal>

            <Reveal as="li" delay={0.18} className="bg-surface-solid flex flex-col justify-between gap-6 rounded-md p-6 sm:p-8 md:col-span-2">
              <p className="text-text-strong m-0 flex items-end gap-3">
                <span className="font-display text-7xl leading-[0.85] tracking-[-0.04em]">4</span>
                <span className="text-text-muted pb-1">rôles d&apos;équipe</span>
              </p>
              <ul aria-label="Rôles" className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                {ROLES.map((role) => (
                  <li key={role} className="border-border-strong text-text-strong rounded-full border px-3 py-1 text-xs">
                    {role}
                  </li>
                ))}
              </ul>
              <p className="text-text-muted m-0 flex items-center gap-2 text-sm">
                <IconLock size={16} stroke={1.75} aria-hidden="true" />
                Données cloisonnées par agence
              </p>
            </Reveal>
          </ul>
        </Container>
      </Section>

      <Section tone="subtle" labelledBy="faq-tarifs-titre">
        <Container className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col gap-6 lg:sticky lg:top-28 lg:col-span-4 lg:self-start">
            <SectionHeading
              id="faq-tarifs-titre"
              index="03"
              eyebrow="Questions fréquentes"
              title={
                <>
                  Tarifs et <Highlight>abonnement</Highlight>
                </>
              }
            />
            <Link href="/contact" className="site-link text-text-strong inline-flex items-center gap-2 self-start font-medium">
              Une autre question ? Écrivez-nous <IconArrowRight size={18} stroke={1.75} aria-hidden="true" />
            </Link>
          </div>
          <Reveal delay={0.1} className="lg:col-span-8">
            <Faq items={FAQ} name="faq-tarifs" />
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
