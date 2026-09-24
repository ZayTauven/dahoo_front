import Link from "next/link";
import type { ReactNode } from "react";

export interface Crumb {
  label: string;
  href?: string;
}

/** En-tête de page de l'espace agence : fil d'Ariane, titre, sous-titre et actions. */
export function PageHead({
  title,
  subtitle,
  crumbs = [],
  actions,
}: {
  title: string;
  subtitle?: ReactNode;
  crumbs?: Crumb[];
  actions?: ReactNode;
}) {
  return (
    <div className="ax-page-head">
      <div className="ax-page-head__row">
        <div>
          {crumbs.length > 0 && (
            <nav className="ax-breadcrumb" aria-label="Fil d'Ariane">
              <ol className="ax-breadcrumb__list">
                {crumbs.map((crumb, index) => (
                  <li key={`${crumb.label}-${index}`} className="ax-breadcrumb__item">
                    {crumb.href && index < crumbs.length - 1 ? (
                      <Link href={crumb.href}>{crumb.label}</Link>
                    ) : (
                      <span aria-current={index === crumbs.length - 1 ? "page" : undefined}>{crumb.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <h1 className="ax-page-head__title">{title}</h1>
          {subtitle && <p className="ax-page-head__subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="ax-page-head__actions">{actions}</div>}
      </div>
    </div>
  );
}
