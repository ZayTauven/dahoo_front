import { IconAlertCircle, IconCircleCheck, IconCheck } from "@tabler/icons-react";

import { Container, Section } from "@/components/site/layout";
import { Highlight, Reveal } from "@/components/site/motion";
import { SectionHeading } from "@/components/site/SectionHeading";

const ROWS = [
  {
    subject: "Loyers",
    before: "Suivis au cahier : qui a payé, qui doit encore, depuis quand ?",
    after: "Chaque bail a ses échéances ; les impayés ressortent d'un filtre.",
  },
  {
    subject: "Paiements",
    before: "Captures Wave perdues dans les discussions, reçus d'espèces introuvables.",
    after: "Chaque paiement enregistré avec son moyen, sa référence et son auteur.",
  },
  {
    subject: "Pannes",
    before: "Signalées par téléphone, passées de main en main, vite oubliées.",
    after: "Un ticket par incident : priorité, responsable, statut, journal.",
  },
  {
    subject: "Annonces",
    before: "Photos et prix à renvoyer à chaque prospect, visites dispersées.",
    after: "Publiées sur le portail ; les demandes de visite arrivent chez vous.",
  },
];

/**
 * Avant / avec Dahoo (d'après la « Comparison Section » de 21st) : deux colonnes face à face, une
 * ligne par sujet. À gauche le quotidien barré, à droite la même tâche dans Dahoo.
 */
export function Comparison() {
  return (
    <Section tone="subtle" labelledBy="avant-titre">
      <Container className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
        <SectionHeading
          id="avant-titre"
          index="01"
          eyebrow="Avant / avec Dahoo"
          className="lg:sticky lg:top-28 lg:col-span-4 lg:self-start"
          title={
            <>
              Le même mois, <Highlight>vécu deux fois</Highlight>
            </>
          }
        />

        <Reveal className="lg:col-span-8">
          <div role="table" aria-label="Le quotidien d'une agence, avant et avec Dahoo" className="border-border-strong overflow-hidden rounded-md border">
            <div role="rowgroup" className="hidden md:block">
              <div role="row" className="border-border-strong grid grid-cols-[7rem_1fr_1fr] border-b">
                <span role="columnheader">
                  <span className="sr-only">Sujet</span>
                </span>
                <span role="columnheader" className="site-label text-text-muted flex items-center gap-2 px-6 py-4">
                  <IconAlertCircle size={16} stroke={1.75} aria-hidden="true" />
                  Aujourd&apos;hui
                </span>
                <span role="columnheader" className="site-label text-text-strong bg-surface-solid flex items-center gap-2 px-6 py-4">
                  <IconCircleCheck size={16} stroke={1.75} aria-hidden="true" className="text-accent-text" />
                  Avec Dahoo
                </span>
              </div>
            </div>
            <div role="rowgroup">
              {ROWS.map((row) => (
                <div
                  role="row"
                  key={row.subject}
                  className="border-border-default grid grid-cols-1 border-b last:border-b-0 md:grid-cols-[7rem_1fr_1fr]"
                >
                  <span role="rowheader" className="font-display text-text-strong px-5 pt-5 text-2xl leading-none md:px-6 md:py-6">
                    {row.subject}
                  </span>
                  <p role="cell" className="text-text-muted m-0 flex gap-3 px-5 py-3 leading-snug md:px-6 md:py-6">
                    <span aria-hidden="true" className="text-text-subtle font-mono">
                      —
                    </span>
                    <span>
                      <span className="sr-only">Aujourd&apos;hui : </span>
                      <s className="decoration-text-subtle/70">{row.before}</s>
                    </span>
                  </p>
                  <p role="cell" className="text-text-strong bg-surface-solid m-0 flex gap-3 px-5 py-4 leading-snug md:px-6 md:py-6">
                    <IconCheck size={18} stroke={2} aria-hidden="true" className="text-accent-text mt-0.5 shrink-0" />
                    <span>
                      <span className="sr-only">Avec Dahoo : </span>
                      {row.after}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
