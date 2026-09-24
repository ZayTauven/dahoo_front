"use client";

import { useSession } from "@/lib/auth/useSession";
import { daysUntil, formatDate } from "@/lib/format";

/** Rappelle l'état de l'essai gratuit ou signale le passage en lecture seule. */
export function AccessBanner() {
  const { membership } = useSession();
  if (!membership || membership.access_status === "ACTIVE") return null;

  if (membership.access_status === "EXPIRED") {
    return (
      <div className="ax-alert ax-alert--danger" role="alert">
        <div className="ax-alert__content">
          <b className="ax-alert__title">Période d&apos;essai terminée</b>
          <p className="ax-alert__message">
            Vos données restent consultables, mais les modifications sont bloquées. Contactez Dahoo pour activer votre
            abonnement.
          </p>
        </div>
      </div>
    );
  }

  const remaining = daysUntil(membership.trial_ends_at);
  if (remaining > 7) return null;
  return (
    <div className="ax-alert ax-alert--warning" role="status">
      <div className="ax-alert__content">
        <b className="ax-alert__title">
          Essai gratuit : {remaining <= 1 ? "dernier jour" : `${remaining} jours restants`}
        </b>
        <p className="ax-alert__message">
          Votre essai se termine le {formatDate(membership.trial_ends_at)}. Pensez à activer votre abonnement pour
          continuer sans interruption.
        </p>
      </div>
    </div>
  );
}
