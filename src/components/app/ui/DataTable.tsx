"use client";

import { IconChevronLeft, IconChevronRight, IconDatabaseOff } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { EmptyState } from "@/components/app/EmptyState";
import { formatNumber } from "@/lib/format";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Colonne numérique (alignée à droite, chiffres tabulaires). */
  numeric?: boolean;
  /** Masquée sous 768 px pour garder le tableau lisible sur mobile. */
  hideOnMobile?: boolean;
}

export const PAGE_SIZE = 25;

/**
 * Tableau de l'espace agence (classes .ax-table de Vireo) : états de chargement, d'erreur et vide,
 * ligne cliquable (`rowHref`) accessible au clavier, pagination serveur (Django, 25 par page).
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  rowHref,
  loading = false,
  error,
  onRetry,
  empty,
  caption,
  count,
  page = 1,
  onPageChange,
}: {
  columns: Column<T>[];
  rows: T[] | undefined;
  rowKey: (row: T) => string | number;
  rowHref?: (row: T) => string;
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  /** Contenu affiché quand la liste est vide (généralement un <EmptyState>). */
  empty?: ReactNode;
  /** Titre accessible du tableau (lu par les lecteurs d'écran). */
  caption: string;
  count?: number;
  page?: number;
  onPageChange?: (page: number) => void;
}) {
  const router = useRouter();
  const mobileHidden = (column: Column<T>) => (column.hideOnMobile ? " max-md:hidden" : "");

  if (error) {
    return (
      <div className="ax-alert ax-alert--danger" role="alert">
        <div className="ax-alert__content">
          <p className="ax-alert__message">{error.message}</p>
        </div>
        {onRetry && (
          <div className="ax-alert__actions">
            <button type="button" className="ax-btn ax-btn--sm ax-btn--ghost" onClick={onRetry}>
              <span className="ax-btn__label">Réessayer</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!loading && rows && rows.length === 0) {
    return <>{empty ?? <EmptyState icon={IconDatabaseOff} title="Aucun résultat" />}</>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="ax-table-wrap">
        <table className="ax-table ax-table--hover">
          <caption className="sr-only">{caption}</caption>
          <thead className="ax-table__head">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`ax-table__th${column.numeric ? " ax-table__th--num" : ""}${mobileHidden(column)}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody aria-busy={loading}>
            {loading && !rows
              ? Array.from({ length: 5 }, (_, index) => (
                  <tr key={`chargement-${index}`} className="ax-table__row">
                    {columns.map((column) => (
                      <td key={column.key} className={`ax-table__td${mobileHidden(column)}`}>
                        <span className="ax-skeleton ax-skeleton--text" style={{ inlineSize: "70%" }} />
                      </td>
                    ))}
                  </tr>
                ))
              : rows?.map((row) => {
                  const href = rowHref?.(row);
                  return (
                    <tr
                      key={rowKey(row)}
                      className={`ax-table__row${href ? " cursor-pointer" : ""}`}
                      onClick={href ? () => router.push(href) : undefined}
                      onKeyDown={href ? (event) => event.key === "Enter" && router.push(href) : undefined}
                      tabIndex={href ? 0 : undefined}
                    >
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={`ax-table__td${column.numeric ? " ax-table__td--num ax-num" : ""}${mobileHidden(column)}`}
                        >
                          {column.cell(row)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>
      {count !== undefined && onPageChange && <Pagination count={count} page={page} onPageChange={onPageChange} />}
    </div>
  );
}

/** Pagination résumée : « 26–50 sur 132 », précédent / suivant et numéros de page proches. */
export function Pagination({ count, page, onPageChange }: { count: number; page: number; onPageChange: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  if (pages <= 1) return null;
  const first = (page - 1) * PAGE_SIZE + 1;
  const last = Math.min(count, page * PAGE_SIZE);
  const around = Array.from({ length: pages }, (_, index) => index + 1).filter(
    (candidate) => candidate === 1 || candidate === pages || Math.abs(candidate - page) <= 1,
  );

  return (
    <nav className="ax-pagination" aria-label="Pagination">
      <span className="ax-pagination__summary">
        {formatNumber(first)}–{formatNumber(last)} sur {formatNumber(count)}
      </span>
      <button
        type="button"
        className="ax-pagination__prev"
        disabled={page <= 1}
        aria-disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Page précédente"
      >
        <IconChevronLeft stroke={1.75} aria-hidden="true" />
      </button>
      <ul className="ax-pagination__pages">
        {around.map((candidate, index) => (
          <li key={candidate} className="contents">
            {index > 0 && candidate - around[index - 1] > 1 && <span className="ax-pagination__ellipsis">…</span>}
            <button
              type="button"
              className="ax-pagination__page"
              aria-current={candidate === page ? "page" : undefined}
              onClick={() => onPageChange(candidate)}
            >
              {candidate}
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="ax-pagination__next"
        disabled={page >= pages}
        aria-disabled={page >= pages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Page suivante"
      >
        <IconChevronRight stroke={1.75} aria-hidden="true" />
      </button>
    </nav>
  );
}
