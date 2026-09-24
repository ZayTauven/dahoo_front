import { IconHammer } from "@tabler/icons-react";

import { EmptyState } from "./EmptyState";
import { PageHead } from "./shell/PageHead";

/** Page d'attente d'un module de l'espace agence, remplacée lors de la phase P3 de la refonte. */
export function ModulePending({ title, description }: { title: string; description: string }) {
  return (
    <>
      <PageHead title={title} crumbs={[{ label: "Espace agence", href: "/espace" }, { label: title }]} />
      <div className="ax-card">
        <EmptyState icon={IconHammer} title="Module en cours de refonte">
          {description}
        </EmptyState>
      </div>
    </>
  );
}
