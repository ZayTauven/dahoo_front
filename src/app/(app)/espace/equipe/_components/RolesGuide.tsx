"use client";

import { IconCheck, IconShieldCheck } from "@tabler/icons-react";
import { useId, useRef, useState, type KeyboardEvent } from "react";

import { formatNumber } from "@/lib/format";

import { groupCapabilities, ROLE_SUMMARY, useCapabilities, useRoles } from "./data";

/**
 * Panneau d'aide « Que peut faire chaque rôle ? » : un onglet par rôle, ses droits regroupés par
 * domaine avec leur description française (source : /access/roles/ et /access/capabilities/).
 */
export function RolesGuide() {
  const roles = useRoles();
  const capabilities = useCapabilities();
  const [selected, setSelected] = useState<string>();
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const baseId = useId();

  const list = roles.data ?? [];
  const active = list.find((role) => role.code === selected) ?? list[0];
  const loading = roles.isLoading || capabilities.isLoading;
  const error = roles.error ?? capabilities.error;

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const moves: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: list.length - 1 };
    if (!(event.key in moves)) return;
    event.preventDefault();
    const next = (moves[event.key] + list.length) % list.length;
    setSelected(list[next].code);
    tabsRef.current[next]?.focus();
  };

  return (
    <section className="ax-card" aria-labelledby={`${baseId}-titre`} id="roles">
      <div className="ax-card__header">
        <div className="ax-card__titles">
          <h2 className="ax-card__title flex items-center gap-2" id={`${baseId}-titre`}>
            <IconShieldCheck className="text-accent-text size-5 shrink-0" stroke={1.75} aria-hidden="true" />
            Que peut faire chaque rôle ?
          </h2>
          <p className="ax-card__subtitle">
            Les rôles sont définis par Dahoo et identiques pour toutes les agences. Choisissez celui qui correspond au travail
            de chaque membre.
          </p>
        </div>
      </div>
      <div className="ax-card__body">
        {error ? (
          <div className="ax-alert ax-alert--danger" role="alert">
            <div className="ax-alert__content">
              <p className="ax-alert__message">{error.message}</p>
            </div>
            <div className="ax-alert__actions">
              <button
                type="button"
                className="ax-btn ax-btn--sm ax-btn--ghost"
                onClick={() => {
                  roles.refetch();
                  capabilities.refetch();
                }}
              >
                <span className="ax-btn__label">Réessayer</span>
              </button>
            </div>
          </div>
        ) : loading || !active ? (
          <div className="flex flex-col gap-3" aria-busy="true" aria-label="Chargement des rôles">
            <span className="ax-skeleton ax-skeleton--text" style={{ inlineSize: "60%" }} />
            <span className="ax-skeleton ax-skeleton--text" style={{ inlineSize: "85%" }} />
            <span className="ax-skeleton ax-skeleton--text" style={{ inlineSize: "40%" }} />
          </div>
        ) : (
          <div className="ax-tabs ax-tabs--segmented ax-tabs--scrollable">
            <div className="ax-tabs__list" role="tablist" aria-label="Rôles">
              {list.map((role, index) => {
                const isActive = role.code === active.code;
                return (
                  <button
                    key={role.code}
                    ref={(node) => {
                      tabsRef.current[index] = node;
                    }}
                    type="button"
                    role="tab"
                    id={`${baseId}-onglet-${role.code}`}
                    aria-selected={isActive}
                    aria-controls={`${baseId}-panneau`}
                    tabIndex={isActive ? 0 : -1}
                    className="ax-tabs__tab shrink-0 whitespace-nowrap"
                    onClick={() => setSelected(role.code)}
                    onKeyDown={(event) => onKeyDown(event, index)}
                  >
                    {role.label}
                  </button>
                );
              })}
            </div>
            <div className="ax-tabs__panel" role="tabpanel" id={`${baseId}-panneau`} aria-labelledby={`${baseId}-onglet-${active.code}`} tabIndex={0}>
              <p className="text-text m-0">
                {ROLE_SUMMARY[active.code] ?? `Rôle « ${active.label} ».`}{" "}
                <span className="text-text-muted">
                  ({formatNumber(active.capabilities.length)} {active.capabilities.length > 1 ? "droits" : "droit"})
                </span>
              </p>
              {active.capabilities.length === 0 ? (
                <p className="text-text-muted mt-4 mb-0">Ce rôle ne donne aucun droit pour l&apos;instant.</p>
              ) : (
                <div className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
                  {groupCapabilities(active.capabilities, capabilities.data ?? []).map((group) => (
                    <div key={group.label} className="min-w-0">
                      <h3 className="text-text-subtle m-0 text-xs font-semibold tracking-wide uppercase">{group.label}</h3>
                      <ul className="m-0 mt-2 flex list-none flex-col gap-1.5 p-0">
                        {group.items.map((item) => (
                          <li key={item.code} className="text-text flex items-start gap-2 text-sm">
                            <IconCheck className="text-success mt-0.5 size-4 shrink-0" stroke={2} aria-hidden="true" />
                            <span>{item.description}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
