"use client";

import { IconArrowsSplit2, IconCalendarCheck } from "@tabler/icons-react";
import type { UseQueryResult } from "@tanstack/react-query";
import { useState } from "react";

import type { Schema } from "@/lib/api/types";
import { formatDate } from "@/lib/format";
import { enumLabel, SCHEDULE_TYPE } from "@/lib/labels";
import { cn } from "@/lib/utils";

import { isLate, todayIso, type OpenSchedule } from "./data";
import {
  centsToDecimal,
  centsToInput,
  distribute,
  formatCents,
  parseAmountInput,
  toCents,
} from "./money";

/*
 * Affectation d'un montant à des échéances : cases à cocher, montant modifiable prérempli par le
 * reste dû, répartition automatique par ordre d'échéance, total affecté contrôlé en direct.
 */

type AllocationInput = Schema<"AllocationInputRequest">;

interface ManualLine {
  checked: boolean;
  input: string;
}

export interface AllocationLine extends OpenSchedule {
  checked: boolean;
  input: string;
  /** Montant saisi en centimes (NaN si invalide). */
  cents: number;
  error?: string;
}

export type AllocationMode = "auto" | "preset" | "manual";

/**
 * État de l'affectation.
 * - « auto » : le montant payé est réparti sur les échéances les plus anciennes (suit la saisie du montant) ;
 * - « preset » : seule l'échéance choisie au départ est cochée (paiement lancé depuis une échéance) ;
 * - « manual » : l'utilisateur a coché ou modifié une ligne.
 */
export function useAllocation({
  open,
  budget,
  presetId,
}: {
  open: OpenSchedule[] | undefined;
  budget: number | null;
  presetId?: number;
}) {
  const hasPreset =
    presetId !== undefined &&
    Boolean(open?.some((entry) => entry.schedule.id === presetId));
  const [mode, setMode] = useState<AllocationMode>(
    presetId !== undefined ? "preset" : "auto",
  );
  const [manual, setManual] = useState<Record<number, ManualLine>>({});
  const effectiveMode: AllocationMode =
    mode === "preset" && !hasPreset ? "auto" : mode;
  const usable =
    budget !== null && Number.isFinite(budget) && budget > 0 ? budget : 0;

  const derived = (): Record<number, ManualLine> => {
    const entries = open ?? [];
    if (effectiveMode === "manual") return manual;
    if (effectiveMode === "preset") {
      return Object.fromEntries(
        entries.map((entry) => {
          const selected = entry.schedule.id === presetId;
          const amount = usable
            ? Math.min(usable, entry.remaining)
            : entry.remaining;
          return [
            entry.schedule.id,
            { checked: selected, input: selected ? centsToInput(amount) : "" },
          ];
        }),
      );
    }
    const parts = distribute(
      usable,
      entries.map((entry) => entry.remaining),
    );
    return Object.fromEntries(
      entries.map((entry, index) => [
        entry.schedule.id,
        {
          checked: parts[index] > 0,
          input: parts[index] > 0 ? centsToInput(parts[index]) : "",
        },
      ]),
    );
  };
  const current = derived();

  const lines: AllocationLine[] = (open ?? []).map((entry) => {
    const line = current[entry.schedule.id] ?? { checked: false, input: "" };
    const parsed = parseAmountInput(line.input);
    const cents = parsed ?? Number.NaN;
    let error: string | undefined;
    if (line.checked) {
      if (parsed === null) error = "Indiquez le montant à affecter.";
      else if (Number.isNaN(cents))
        error = "Montant invalide (exemple : 150000).";
      else if (cents <= 0) error = "Le montant doit être positif.";
      else if (cents > entry.remaining)
        error = `Au plus ${formatCents(entry.remaining)} (reste dû).`;
    }
    return { ...entry, checked: line.checked, input: line.input, cents, error };
  });

  const selected = lines.filter((line) => line.checked);
  const total = selected.reduce(
    (sum, line) => sum + (Number.isFinite(line.cents) ? line.cents : 0),
    0,
  );
  const overBudget =
    budget !== null && Number.isFinite(budget) && total > budget;

  const edit = (
    id: number,
    change: (line: ManualLine, entry: OpenSchedule) => ManualLine,
  ) => {
    const base = derived();
    const entry = open?.find((candidate) => candidate.schedule.id === id);
    if (!entry) return;
    setManual({
      ...base,
      [id]: change(base[id] ?? { checked: false, input: "" }, entry),
    });
    setMode("manual");
  };

  return {
    mode: effectiveMode,
    lines,
    total,
    overBudget,
    hasErrors: selected.some((line) => line.error) || overBudget,
    /** Affectations prêtes pour l'API. */
    items: selected
      .filter((line) => !line.error && line.cents > 0)
      .map<AllocationInput>((line) => ({
        schedule: line.schedule.id,
        amount: centsToDecimal(line.cents),
      })),
    toggle: (id: number) =>
      edit(id, (line, entry) => {
        if (line.checked) return { checked: false, input: line.input };
        // Montant proposé : le reste dû, dans la limite de ce qui n'est pas encore affecté.
        const left = usable - total;
        const proposed =
          left > 0 ? Math.min(left, entry.remaining) : entry.remaining;
        return { checked: true, input: line.input || centsToInput(proposed) };
      }),
    setAmount: (id: number, input: string) =>
      edit(id, () => ({ checked: true, input })),
    autoDistribute: () => {
      setManual({});
      setMode("auto");
    },
    reset: () => {
      setManual({});
      setMode("auto");
    },
  };
}

export type AllocationState = ReturnType<typeof useAllocation>;

export function AllocationPicker({
  state,
  query,
  budget,
  budgetLabel = "Montant payé",
  error,
  idPrefix,
}: {
  state: AllocationState;
  query: Pick<
    UseQueryResult<OpenSchedule[]>,
    "isLoading" | "error" | "refetch"
  >;
  /** Montant à répartir, en centimes (null si pas encore saisi). */
  budget: number | null;
  budgetLabel?: string;
  /** Erreur de l'API sur les affectations. */
  error?: string;
  idPrefix: string;
}) {
  const today = todayIso();
  const validBudget =
    budget !== null && Number.isFinite(budget) && budget > 0 ? budget : null;
  const left = validBudget !== null ? validBudget - state.total : null;

  return (
    <section
      className="flex min-w-0 flex-col gap-3"
      aria-labelledby={`${idPrefix}-affectation`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3
          id={`${idPrefix}-affectation`}
          className="text-text-strong m-0 text-base font-semibold"
        >
          Affectation aux échéances
        </h3>
        {state.lines.length > 0 && (
          <button
            type="button"
            className="ax-btn ax-btn--ghost ax-btn--sm"
            onClick={state.autoDistribute}
            disabled={validBudget === null}
            aria-pressed={state.mode === "auto"}
          >
            <IconArrowsSplit2
              className="ax-btn__icon"
              stroke={1.75}
              aria-hidden="true"
            />
            <span className="ax-btn__label">Répartir automatiquement</span>
          </button>
        )}
      </div>

      {query.isLoading ? (
        <div className="flex flex-col gap-2" aria-busy="true">
          <span className="sr-only">Chargement des échéances…</span>
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className="ax-skeleton block h-14 w-full rounded-md"
            />
          ))}
        </div>
      ) : query.error ? (
        <div className="ax-alert ax-alert--danger" role="alert">
          <div className="ax-alert__content">
            <p className="ax-alert__message">
              Impossible de charger les échéances : {query.error.message}
            </p>
          </div>
          <div className="ax-alert__actions">
            <button
              type="button"
              className="ax-btn ax-btn--sm ax-btn--ghost"
              onClick={() => query.refetch()}
            >
              <span className="ax-btn__label">Réessayer</span>
            </button>
          </div>
        </div>
      ) : state.lines.length === 0 ? (
        <div className="border-border-default bg-surface-subtle text-text-muted flex items-start gap-3 rounded-md border p-3 text-sm">
          <IconCalendarCheck
            className="text-success mt-0.5 size-5 shrink-0"
            stroke={1.75}
            aria-hidden="true"
          />
          <p className="m-0">
            Aucune échéance à régler pour ce locataire. Le paiement sera
            enregistré sans affectation : vous pourrez l&apos;affecter plus
            tard.
          </p>
        </div>
      ) : (
        <>
          <p className="text-text-subtle m-0 text-xs">
            Les échéances les plus anciennes sont réglées en premier. Cochez ou
            modifiez les montants pour changer la répartition.
          </p>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {state.lines.map((line) => {
              const { schedule } = line;
              const checkboxId = `${idPrefix}-echeance-${schedule.id}`;
              const amountId = `${checkboxId}-montant`;
              const errorId = `${checkboxId}-erreur`;
              const late = isLate(schedule, today);
              const due = toCents(schedule.amount_due);
              return (
                <li
                  key={schedule.id}
                  className={cn(
                    "rounded-md border p-3 transition-colors",
                    line.checked
                      ? "border-brand bg-surface-subtle"
                      : "border-border-default",
                  )}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <label
                      htmlFor={checkboxId}
                      className="flex min-w-0 flex-1 cursor-pointer items-start gap-3"
                    >
                      <input
                        id={checkboxId}
                        type="checkbox"
                        className="ax-checkbox mt-0.5 shrink-0"
                        checked={line.checked}
                        onChange={() => state.toggle(schedule.id)}
                      />
                      <span className="flex min-w-0 flex-col">
                        <span className="text-text-strong text-sm font-medium">
                          {enumLabel(SCHEDULE_TYPE, schedule.schedule_type)} du{" "}
                          {formatDate(schedule.due_date)}
                          {late && (
                            <span className="ax-badge ax-badge--soft ax-badge--danger ax-badge--sm ml-2 align-middle">
                              En retard
                            </span>
                          )}
                        </span>
                        <span className="text-text-subtle truncate text-xs">
                          {schedule.contract_label}
                        </span>
                        <span className="text-text-muted ax-num text-xs">
                          Reste dû : {formatCents(line.remaining)}
                          {line.remaining < due && ` sur ${formatCents(due)}`}
                        </span>
                      </span>
                    </label>
                    <div className="flex flex-col gap-1 sm:w-40 sm:shrink-0">
                      <label htmlFor={amountId} className="sr-only">
                        Montant affecté à l&apos;échéance du{" "}
                        {formatDate(schedule.due_date)}
                      </label>
                      <div
                        className={cn(
                          "ax-input-group",
                          line.error && "is-invalid",
                        )}
                      >
                        <input
                          id={amountId}
                          type="text"
                          inputMode="decimal"
                          autoComplete="off"
                          className="ax-input ax-input--sm ax-num min-w-0 flex-1 text-right"
                          value={line.input}
                          placeholder="0"
                          onChange={(event) =>
                            state.setAmount(schedule.id, event.target.value)
                          }
                          aria-invalid={Boolean(line.error)}
                          aria-describedby={line.error ? errorId : undefined}
                        />
                        <span className="ax-input-group__addon text-xs">
                          FCFA
                        </span>
                      </div>
                    </div>
                  </div>
                  {line.error && (
                    <p
                      id={errorId}
                      className="ax-field__message ax-field__message--error mt-2 mb-0"
                    >
                      {line.error}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}

      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-md px-3 py-2 text-sm",
          state.overBudget
            ? "bg-surface-subtle text-danger"
            : "bg-surface-subtle text-text",
        )}
        aria-live="polite"
      >
        <span>
          Affecté :{" "}
          <strong className="ax-num">{formatCents(state.total)}</strong>
          {validBudget !== null && (
            <>
              {" "}
              sur <span className="ax-num">{formatCents(validBudget)}</span> (
              {budgetLabel.toLowerCase()})
            </>
          )}
        </span>
        {left !== null && (
          <span
            className={cn(
              "font-medium",
              left < 0 ? "text-danger" : "text-text-muted",
            )}
          >
            {left < 0
              ? `Dépassement de ${formatCents(-left)}`
              : left > 0
                ? `Non affecté : ${formatCents(left)}`
                : "Montant entièrement affecté"}
          </span>
        )}
      </div>
      {state.overBudget && (
        <p
          className="ax-field__message ax-field__message--error m-0"
          role="alert"
        >
          Le total affecté ne peut pas dépasser le {budgetLabel.toLowerCase()}.
        </p>
      )}
      {error && (
        <p
          className="ax-field__message ax-field__message--error m-0"
          role="alert"
        >
          {error}
        </p>
      )}
    </section>
  );
}
