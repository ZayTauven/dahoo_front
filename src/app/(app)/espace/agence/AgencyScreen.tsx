"use client";

import { IconLock } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/app/EmptyState";
import { PageHead } from "@/components/app/shell/PageHead";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { useSession } from "@/lib/auth/useSession";

import { ORGANIZATION_KEY, OrganizationCard } from "./_components/OrganizationCard";
import { SubscriptionCard } from "./_components/SubscriptionCard";

/** Mon agence : coordonnées (modifiables avec organization.update) et abonnement. */
export function AgencyScreen() {
  const session = useSession();
  const { can, isReadOnly } = session;
  const allowed = can("organization.view");

  const organization = useQuery({
    queryKey: ORGANIZATION_KEY,
    queryFn: async () => unwrap(await api.GET("/api/v1/organizations/current/")),
    enabled: allowed,
  });

  const head = (
    <PageHead
      title="Mon agence"
      subtitle="Les coordonnées de votre agence et l'état de votre abonnement Dahoo."
      crumbs={[{ label: "Espace agence", href: "/espace" }, { label: "Mon agence" }]}
    />
  );

  if (!session.isLoading && !allowed) {
    return (
      <>
        {head}
        <section className="ax-card">
          <div className="ax-card__body">
            <EmptyState icon={IconLock} title="Accès réservé">
              Votre rôle ne permet pas de consulter les informations de l&apos;agence. Adressez-vous à un administrateur.
            </EmptyState>
          </div>
        </section>
      </>
    );
  }

  if (organization.error) {
    return (
      <>
        {head}
        <div className="ax-alert ax-alert--danger" role="alert">
          <div className="ax-alert__content">
            <p className="ax-alert__message">{organization.error.message}</p>
          </div>
          <div className="ax-alert__actions">
            <button type="button" className="ax-btn ax-btn--sm ax-btn--ghost" onClick={() => organization.refetch()}>
              <span className="ax-btn__label">Réessayer</span>
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!organization.data) {
    return (
      <>
        {head}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]" aria-busy="true" aria-label="Chargement">
          {[0, 1].map((index) => (
            <div key={index} className="ax-card">
              <div className="ax-card__body flex flex-col gap-4">
                <span className="ax-skeleton ax-skeleton--text" style={{ inlineSize: "45%" }} />
                <span className="ax-skeleton ax-skeleton--text" style={{ inlineSize: "80%" }} />
                <span className="ax-skeleton ax-skeleton--text" style={{ inlineSize: "65%" }} />
                <span className="ax-skeleton ax-skeleton--text" style={{ inlineSize: "30%" }} />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  const canEdit = can("organization.update");
  const readOnlyReason = isReadOnly
    ? "Votre essai est terminé : les informations de l'agence ne peuvent plus être modifiées jusqu'à l'activation d'un abonnement."
    : canEdit
      ? undefined
      : "Seul un administrateur de l'agence peut modifier ces informations.";

  return (
    <>
      {head}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <OrganizationCard organization={organization.data} editable={canEdit && !isReadOnly} readOnlyReason={readOnlyReason} />
        <SubscriptionCard organization={organization.data} canViewSubscriptions={can("subscription.view")} />
      </div>
    </>
  );
}
