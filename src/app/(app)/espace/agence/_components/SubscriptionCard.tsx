"use client";

import { IconArrowUpRight, IconCreditCard, IconReceipt } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { StatusBadge } from "@/components/app/ui/StatusBadge";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import type { Schema } from "@/lib/api/types";
import { ACCESS_STATUS, SUBSCRIPTION_STATUS } from "@/lib/labels";
import { daysUntil, formatDate, formatMoney } from "@/lib/format";

import type { Organization } from "./OrganizationCard";

type Subscription = Schema<"Subscription">;
type Plan = Schema<"SubscriptionPlan">;

const DAY = 86_400_000;

/** Tarif lisible d'un plan : « 25 000 F CFA / mois », « 5 % des encaissements »… */
function planPrice(plan: Plan): string {
  if (plan.billing_type === "COMMISSION") {
    return plan.commission_rate !== null && plan.commission_rate !== undefined
      ? `Commission de ${String(plan.commission_rate).replace(".", ",")} % sur les encaissements`
      : "Commission sur les encaissements";
  }
  if (!plan.price) return plan.billing_type === "YEARLY" ? "Facturation annuelle" : "Facturation mensuelle";
  return `${formatMoney(plan.price)} / ${plan.billing_type === "YEARLY" ? "an" : "mois"}`;
}

function planLimits(plan: Plan): string | null {
  const limits = [
    plan.max_properties != null && `${plan.max_properties} biens`,
    plan.max_units != null && `${plan.max_units} lots`,
    plan.max_users != null && `${plan.max_users} utilisateurs`,
  ].filter(Boolean);
  return limits.length ? `Jusqu'à ${limits.join(", ")}` : null;
}

/** Statut d'accès, fin de l'essai, abonnements et marche à suivre pour s'abonner. */
export function SubscriptionCard({ organization, canViewSubscriptions }: { organization: Organization; canViewSubscriptions: boolean }) {
  const subscriptions = useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => unwrap(await api.GET("/api/v1/subscriptions/subscriptions/")),
    enabled: canViewSubscriptions,
  });

  const status = organization.access_status;
  const remaining = daysUntil(organization.trial_ends_at);
  const trialLength = Math.max(1, Math.round((new Date(organization.trial_ends_at).getTime() - new Date(organization.created_at).getTime()) / DAY));
  const elapsed = Math.min(100, Math.max(0, Math.round(((trialLength - Math.max(0, remaining)) / trialLength) * 100)));

  return (
    <section className="ax-card" aria-labelledby="agence-abonnement-titre">
      <div className="ax-card__header">
        <div className="ax-card__titles">
          <h2 className="ax-card__title flex items-center gap-2" id="agence-abonnement-titre">
            <IconCreditCard className="text-accent-text size-5 shrink-0" stroke={1.75} aria-hidden="true" />
            Abonnement
          </h2>
          <p className="ax-card__subtitle">Votre accès à Dahoo et vos formules.</p>
        </div>
        <div className="ax-card__actions">
          <StatusBadge entries={ACCESS_STATUS} value={status} />
        </div>
      </div>

      <div className="ax-card__body flex flex-col gap-5">
        {status === "TRIAL" && (
          <div className="flex flex-col gap-2">
            <p className="text-text m-0">
              <span className="font-display text-text-strong ax-num text-2xl font-semibold">
                {remaining <= 1 ? "Dernier jour" : `${remaining} jours`}
              </span>{" "}
              {remaining > 1 && <span className="text-text-muted">d&apos;essai restants</span>}
            </p>
            <div
              className={`ax-progress ax-progress--sm${remaining <= 7 ? " ax-progress--warning" : ""}`}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={elapsed}
              aria-label="Part de la période d'essai écoulée"
            >
              <div className="ax-progress__track">
                <div className="ax-progress__fill" style={{ width: `${elapsed}%` }} />
              </div>
            </div>
            <p className="text-text-muted m-0 text-sm">Fin de l&apos;essai gratuit le {formatDate(organization.trial_ends_at)}.</p>
          </div>
        )}

        <div className={`ax-alert ${status === "EXPIRED" ? "ax-alert--danger" : status === "TRIAL" ? "ax-alert--info" : "ax-alert--success"}`} role="status">
          <div className="ax-alert__content">
            {status === "TRIAL" && (
              <>
                <b className="ax-alert__title">Et à la fin de l&apos;essai ?</b>
                <p className="ax-alert__message">
                  Sans abonnement, votre espace passe en lecture seule : vos biens, baux et paiements restent consultables,
                  mais plus aucune création ni modification n&apos;est possible jusqu&apos;à l&apos;activation d&apos;une formule.
                  Rien n&apos;est supprimé.
                </p>
              </>
            )}
            {status === "EXPIRED" && (
              <>
                <b className="ax-alert__title">Espace en lecture seule depuis le {formatDate(organization.trial_ends_at)}</b>
                <p className="ax-alert__message">
                  Vos données sont intactes et consultables. Activez un abonnement pour retrouver la création et la
                  modification : l&apos;accès complet revient dès l&apos;activation.
                </p>
              </>
            )}
            {status === "ACTIVE" && (
              <>
                <b className="ax-alert__title">Votre abonnement est actif</b>
                <p className="ax-alert__message">
                  Toutes les fonctions de votre formule sont disponibles. Pour changer de formule, contactez l&apos;équipe Dahoo.
                </p>
              </>
            )}
          </div>
        </div>

        {canViewSubscriptions && (
          <div className="flex flex-col gap-3">
            <h3 className="text-text-subtle m-0 text-xs font-semibold tracking-wide uppercase">Vos abonnements</h3>
            {subscriptions.isLoading ? (
              <div className="flex flex-col gap-2" aria-busy="true" aria-label="Chargement des abonnements">
                <span className="ax-skeleton ax-skeleton--text" style={{ inlineSize: "70%" }} />
                <span className="ax-skeleton ax-skeleton--text" style={{ inlineSize: "45%" }} />
              </div>
            ) : subscriptions.error ? (
              <div className="ax-alert ax-alert--danger" role="alert">
                <div className="ax-alert__content">
                  <p className="ax-alert__message">{subscriptions.error.message}</p>
                </div>
                <div className="ax-alert__actions">
                  <button type="button" className="ax-btn ax-btn--sm ax-btn--ghost" onClick={() => subscriptions.refetch()}>
                    <span className="ax-btn__label">Réessayer</span>
                  </button>
                </div>
              </div>
            ) : subscriptions.data?.results.length ? (
              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {subscriptions.data.results.map((subscription) => (
                  <SubscriptionItem key={subscription.id} subscription={subscription} />
                ))}
              </ul>
            ) : (
              <p className="text-text-muted m-0 flex items-start gap-2 text-sm">
                <IconReceipt className="mt-0.5 size-4 shrink-0" stroke={1.75} aria-hidden="true" />
                <span>
                  Aucun abonnement pour l&apos;instant{status === "TRIAL" ? " : vous profitez de l'essai gratuit, sans limite de biens ni d'utilisateurs." : "."}
                </span>
              </p>
            )}
          </div>
        )}

        <div className="border-border-default flex flex-col gap-3 border-t pt-5">
          <p className="text-text m-0 text-sm">
            {status === "ACTIVE"
              ? "Besoin d'une autre formule, de plus de lots ou d'utilisateurs ?"
              : "Pour passer à un abonnement, contactez l'équipe Dahoo : nous activons votre formule et votre accès complet sans perte de données."}
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/contact" className="ax-btn ax-btn--primary">
              <span className="ax-btn__label">Contacter Dahoo</span>
              <IconArrowUpRight className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
            </Link>
            <Link href="/tarifs" className="ax-btn ax-btn--secondary">
              <span className="ax-btn__label">Voir les tarifs</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SubscriptionItem({ subscription }: { subscription: Subscription }) {
  const { plan } = subscription;
  const limits = planLimits(plan);
  return (
    <li className="border-border-default bg-surface-subtle flex flex-col gap-2 rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-display text-text-strong font-semibold">{plan.name}</span>
        <StatusBadge entries={SUBSCRIPTION_STATUS} value={subscription.status} />
      </div>
      <p className="text-text m-0 text-sm">{planPrice(plan)}</p>
      {limits && <p className="text-text-muted m-0 text-xs">{limits}</p>}
      <p className="text-text-muted m-0 text-xs">
        Du {formatDate(subscription.start_date)}
        {subscription.end_date ? ` au ${formatDate(subscription.end_date)}` : ", sans date de fin"}
      </p>
    </li>
  );
}
