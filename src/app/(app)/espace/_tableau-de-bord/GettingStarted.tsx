import { IconArrowRight, IconCheck } from "@tabler/icons-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { toNumber, type Dashboard } from "./format";

interface Step {
  title: string;
  text: string;
  href: string;
  done: boolean;
}

/**
 * « Premiers pas » : remplace les graphiques financiers tant que l'agence n'a ni échéance ni paiement.
 * Chaque étape est déduite des données réelles du tableau de bord.
 */
export function GettingStarted({ data }: { data: Dashboard }) {
  const steps: Step[] = [
    {
      title: "Ajouter vos biens",
      text: "Immeubles, villas, locaux : découpez-les en lots.",
      href: "/espace/biens",
      done: (data.portfolio?.units ?? 0) > 0,
    },
    {
      title: "Enregistrer vos locataires",
      text: "Leur fiche sert aux baux et aux paiements.",
      href: "/espace/locataires",
      done: (data.leases?.tenants ?? 0) > 0,
    },
    {
      title: "Créer un premier bail",
      text: "Loyer, charges, dépôt de garantie, puis activation.",
      href: "/espace/baux",
      done: (data.leases?.active ?? 0) > 0,
    },
    {
      title: "Planifier les échéances",
      text: "Les loyers attendus alimentent la trésorerie.",
      href: "/espace/echeances",
      done: toNumber(data.finance?.period_expected) > 0 || (data.finance?.upcoming.length ?? 0) > 0,
    },
    {
      title: "Enregistrer un paiement",
      text: "Wave, Orange Money, virement ou espèces.",
      href: "/espace/paiements?nouveau=1",
      done: (data.finance?.by_method.length ?? 0) > 0,
    },
    {
      title: "Publier une annonce",
      text: "Vos lots libres apparaissent sur le portail Dahoo.",
      href: "/espace/annonces",
      done: (data.listings?.published ?? 0) > 0,
    },
  ];
  const done = steps.filter((step) => step.done).length;
  const progress = Math.round((done / steps.length) * 100);

  return (
    <section className="ax-card ax-col--12" aria-labelledby="tdb-premiers-pas">
      <div className="ax-card__header">
        <div className="ax-card__titles">
          <span className="ax-card__eyebrow">Premiers pas</span>
          <h2 id="tdb-premiers-pas" className="ax-card__title">
            Mettez votre agence en route
          </h2>
          <p className="ax-card__subtitle">
            Les graphiques de trésorerie s&apos;afficheront dès les premières échéances et les premiers paiements.
          </p>
        </div>
        <div className="ax-card__actions flex items-center gap-3">
          <span className="ax-num text-text-muted text-sm">
            {done}/{steps.length}
          </span>
          <span className="bg-surface-subtle block h-2 w-32 overflow-hidden rounded-full">
            <span className="bg-accent block h-full rounded-full" style={{ width: `${progress}%` }} />
          </span>
        </div>
      </div>
      <div className="ax-card__body pt-0">
        <ol className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 xl:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title}>
              <Link
                href={step.href}
                className={cn(
                  "group flex h-full items-start gap-3 rounded-xl border p-4 no-underline transition-colors",
                  step.done ? "border-border-default bg-surface-subtle" : "border-border-strong hover:border-accent hover:bg-accent-wash",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                    step.done ? "bg-success text-white" : "bg-accent-wash text-accent-text",
                  )}
                >
                  {step.done ? <IconCheck size={16} stroke={2.5} aria-label="Fait" /> : index + 1}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className={cn("text-sm font-semibold", step.done ? "text-text-muted line-through" : "text-text-strong")}>
                    {step.title}
                  </span>
                  <span className="text-text-muted text-xs leading-relaxed">{step.text}</span>
                </span>
                {!step.done && (
                  <IconArrowRight
                    size={16}
                    stroke={1.75}
                    aria-hidden="true"
                    className="text-text-subtle mt-1 shrink-0 transition-transform group-hover:translate-x-0.5"
                  />
                )}
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
