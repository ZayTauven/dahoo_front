import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

/** Pages à afficher : la première, la dernière et deux voisines de la page courante, séparées par « … ». */
function visiblePages(current: number, total: number): (number | "gap")[] {
  const pages = new Set([1, total, current - 1, current, current + 1].filter((page) => page >= 1 && page <= total));
  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | "gap")[] = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) result.push("gap");
    result.push(page);
  });
  return result;
}

/**
 * Pagination par liens (sans JavaScript, indexable). `hrefFor(page)` construit l'URL de chaque page
 * en conservant les autres paramètres de la liste.
 */
export function Pagination({
  page,
  pageCount,
  hrefFor,
  label = "Pagination",
}: {
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
  label?: string;
}) {
  if (pageCount <= 1) return null;

  const base =
    "inline-flex h-11 min-w-11 items-center justify-center rounded-full border px-3 text-sm font-semibold no-underline transition-colors";
  const idle = "border-border-default text-text-strong hover:border-brand hover:text-brand";
  const disabled = "border-border-default text-text-subtle pointer-events-none opacity-60";

  return (
    <nav aria-label={label} className="mt-12 flex justify-center">
      <ul className="m-0 flex list-none flex-wrap items-center justify-center gap-2 p-0">
        <li>
          {page > 1 ? (
            <Link href={hrefFor(page - 1)} className={cn(base, idle)} rel="prev">
              <IconChevronLeft size={18} stroke={2} aria-hidden="true" />
              <span className="sr-only">Page précédente</span>
            </Link>
          ) : (
            <span className={cn(base, disabled)} aria-hidden="true">
              <IconChevronLeft size={18} stroke={2} />
            </span>
          )}
        </li>
        {visiblePages(page, pageCount).map((item, index) =>
          item === "gap" ? (
            <li key={`gap-${index}`} aria-hidden="true" className="text-text-subtle px-1">
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                href={hrefFor(item)}
                aria-current={item === page ? "page" : undefined}
                aria-label={`Page ${item}`}
                className={cn(base, item === page ? "bg-brand-600 border-brand-600 text-white" : idle)}
              >
                {item}
              </Link>
            </li>
          ),
        )}
        <li>
          {page < pageCount ? (
            <Link href={hrefFor(page + 1)} className={cn(base, idle)} rel="next">
              <IconChevronRight size={18} stroke={2} aria-hidden="true" />
              <span className="sr-only">Page suivante</span>
            </Link>
          ) : (
            <span className={cn(base, disabled)} aria-hidden="true">
              <IconChevronRight size={18} stroke={2} />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
