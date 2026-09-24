"use client";

import { IconCalendarPlus } from "@tabler/icons-react";
import { useState } from "react";

import { StatusBadge } from "@/components/app/ui/StatusBadge";
import { TextField } from "@/components/app/ui/fields";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { useApiMutation } from "@/lib/api/useApiMutation";
import { daysUntil, formatDate } from "@/lib/format";
import { ACCESS_STATUS } from "@/lib/labels";

import { addDays, endOfDayIso, isPast, KEYS, toDateInput, trialInfo, type Organization } from "./data";

const SHORTCUTS = [7, 14, 30] as const;

/** Statut d'accès et prolongation de l'essai gratuit (PATCH trial_ends_at). */
export function TrialCard({ organization }: { organization: Organization }) {
  const currentEnd = organization.trial_ends_at ? new Date(organization.trial_ends_at) : new Date();
  const expired = isPast(currentEnd);
  // Les raccourcis partent de la fin d'essai actuelle, ou d'aujourd'hui si elle est dépassée.
  const base = expired ? new Date() : currentEnd;
  const [date, setDate] = useState("");
  const [localError, setLocalError] = useState<string>();

  const extend = useApiMutation({
    mutationFn: async (trialEndsAt: string) =>
      unwrap(
        await api.PATCH("/api/v1/platform/organizations/{id}/", {
          params: { path: { id: organization.id } },
          body: { trial_ends_at: trialEndsAt },
        }),
      ),
    invalidate: [KEYS.organizations],
    success: (result) => `Essai prolongé jusqu'au ${formatDate(result.trial_ends_at)}.`,
    onSuccess: () => setDate(""),
  });

  const submit = () => {
    setLocalError(undefined);
    if (!date) return setLocalError("Choisissez la nouvelle date de fin d'essai.");
    const iso = endOfDayIso(date);
    if (isPast(iso)) return setLocalError("Choisissez une date à venir.");
    extend.mutate(iso);
  };

  const trial = trialInfo(organization);
  const shortens = date !== "" && !expired && new Date(endOfDayIso(date)) < currentEnd;
  const remaining = organization.trial_ends_at ? daysUntil(organization.trial_ends_at) : null;

  return (
    <section className="ax-card" aria-labelledby="carte-acces">
      <div className="ax-card__header">
        <div className="ax-card__titles">
          <h2 id="carte-acces" className="ax-card__title">
            Accès et essai
          </h2>
          <p className="ax-card__subtitle">Sans abonnement actif, l&apos;agence passe en lecture seule à la fin de l&apos;essai.</p>
        </div>
      </div>
      <div className="ax-card__body flex flex-col gap-5">
        <dl className="m-0 grid gap-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <dt className="text-text-muted">Statut d&apos;accès</dt>
            <dd className="m-0">
              <StatusBadge entries={ACCESS_STATUS} value={organization.access_status} />
            </dd>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <dt className="text-text-muted">Fin de l&apos;essai</dt>
            <dd className="text-text-strong m-0 font-medium">{formatDate(organization.trial_ends_at)}</dd>
          </div>
          {trial && !organization.is_internal && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <dt className="text-text-muted">Temps restant</dt>
              <dd className={`m-0 font-medium ${trial.expired ? "text-danger" : "text-text-strong"}`}>
                {trial.expired && remaining !== null ? `Expiré depuis ${Math.max(1, -remaining)} jour${-remaining > 1 ? "s" : ""}` : trial.label}
              </dd>
            </div>
          )}
        </dl>

        {organization.is_internal ? (
          <p className="text-text-muted m-0 text-sm">Compte interne Dahoo : accès permanent, l&apos;essai ne s&apos;applique pas.</p>
        ) : (
          <form
            noValidate
            className="border-border-default flex flex-col gap-3 border-t pt-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!extend.isPending) submit();
            }}
          >
            <h3 className="text-text-strong font-display m-0 text-base font-semibold">Prolonger l&apos;essai</h3>
            {organization.access_status === "ACTIVE" && (
              <p className="text-text-muted m-0 text-sm">Un abonnement actif couvre déjà l&apos;accès : l&apos;essai n&apos;a d&apos;effet qu&apos;à son terme.</p>
            )}
            <div className="flex flex-wrap gap-2" role="group" aria-label={`Raccourcis à partir du ${formatDate(base, "short")}`}>
              {SHORTCUTS.map((days) => (
                <button
                  key={days}
                  type="button"
                  className="ax-btn ax-btn--secondary ax-btn--sm"
                  onClick={() => {
                    setLocalError(undefined);
                    setDate(toDateInput(addDays(base, days)));
                  }}
                >
                  <span className="ax-btn__label">+{days} jours</span>
                </button>
              ))}
            </div>
            <TextField
              label="Nouvelle fin d'essai"
              type="date"
              min={toDateInput(addDays(new Date(), 1))}
              value={date}
              onChange={(event) => {
                setLocalError(undefined);
                setDate(event.target.value);
              }}
              error={localError ?? extend.fieldErrors.trial_ends_at}
              hint={
                shortens
                  ? "Attention : cette date raccourcit l'essai en cours."
                  : `Les raccourcis partent du ${formatDate(base)}${expired ? " (aujourd'hui, l'essai étant expiré)" : " (fin actuelle)"}.`
              }
            />
            {extend.formError && (
              <p className="text-danger m-0 text-sm" role="alert">
                {extend.formError}
              </p>
            )}
            <button type="submit" className={`ax-btn ax-btn--primary self-start${extend.isPending ? " is-loading" : ""}`} disabled={extend.isPending} aria-busy={extend.isPending}>
              <span className="ax-btn__spinner" aria-hidden="true" />
              <IconCalendarPlus className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
              <span className="ax-btn__label">{shortens ? "Modifier la fin d'essai" : "Prolonger l'essai"}</span>
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
