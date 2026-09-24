"use client";

import { IconLock } from "@tabler/icons-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { EmptyState } from "@/components/app/EmptyState";
import { PageHead } from "@/components/app/shell/PageHead";
import { useSession } from "@/lib/auth/useSession";

/**
 * Garde de l'espace plateforme : les écrans (et donc leurs requêtes vers /api/v1/platform/)
 * ne sont montés que pour l'équipe Dahoo. L'API reste seule juge (IsPlatformAdmin).
 */
export function PlatformGuard({ children }: { children: ReactNode }) {
  const { user, isPlatformAdmin, error } = useSession();

  if (!user) {
    if (error) {
      return (
        <div className="ax-alert ax-alert--danger" role="alert">
          <div className="ax-alert__content">
            <p className="ax-alert__message">{error.message}</p>
          </div>
          <div className="ax-alert__actions">
            <button type="button" className="ax-btn ax-btn--sm ax-btn--ghost" onClick={() => window.location.reload()}>
              <span className="ax-btn__label">Recharger la page</span>
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-4" aria-busy="true" aria-label="Chargement de l'espace plateforme">
        <span className="ax-skeleton ax-skeleton--text" style={{ inlineSize: 220, blockSize: 28 }} />
        <div className="ax-card">
          <div className="ax-card__body flex flex-col gap-3">
            {Array.from({ length: 4 }, (_, index) => (
              <span key={index} className="ax-skeleton ax-skeleton--text" style={{ inlineSize: `${90 - index * 12}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isPlatformAdmin) {
    return (
      <>
        <PageHead title="Espace plateforme" crumbs={[{ label: "Plateforme Dahoo" }]} />
        <div className="ax-card">
          <EmptyState
            icon={IconLock}
            title="Accès réservé à l'équipe Dahoo"
            action={
              <Link href="/espace" className="ax-btn ax-btn--secondary">
                <span className="ax-btn__label">Retour à mon espace</span>
              </Link>
            }
          >
            Cet espace sert à l&apos;équipe Dahoo pour gérer les agences clientes, leurs essais et leurs abonnements. Votre compte
            n&apos;y a pas accès.
          </EmptyState>
        </div>
      </>
    );
  }

  return <>{children}</>;
}
