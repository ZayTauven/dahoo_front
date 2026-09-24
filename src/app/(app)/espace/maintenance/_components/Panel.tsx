import { useId, type ReactNode } from "react";

/** Carte à titre (h2) de la fiche d'un ticket. */
export function Panel({ title, subtitle, children }: { title: string; subtitle?: ReactNode; children: ReactNode }) {
  const titleId = useId();
  return (
    <section className="ax-card" aria-labelledby={titleId}>
      <div className="ax-card__header">
        <div className="ax-card__titles">
          <h2 className="ax-card__title" id={titleId}>
            {title}
          </h2>
          {subtitle && <p className="ax-card__subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="ax-card__body">{children}</div>
    </section>
  );
}
