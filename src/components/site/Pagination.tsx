import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

/** Pages affichées : la première, la dernière et les voisines de la page courante, séparées par « … ». */
function visiblePages(current: number, total: number): (number | "gap")[] {
  const kept = [...new Set([1, current - 1, current, current + 1, total])]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);
  const result: (number | "gap")[] = [];
  kept.forEach((page, index) => {
    const previous = kept[index - 1];
    if (previous !== undefined && page - previous === 2) result.push(previous + 1);
    else if (previous !== undefined && page - previous > 2) result.push("gap");
    result.push(page);
  });
  return result;
}

const base =
  "inline-flex h-11 min-w-11 items-center justify-center rounded-full px-3 font-mono text-sm no-underline transition-colors duration-300";
const idle = "text-text-strong hover:bg-(--ax-fill-hover)";
const arrow = "border-border-strong text-text-strong hover:bg-text-strong hover:text-canvas border";

/**
 * Pagination du site par liens (`hrefFor(page)` conserve les autres paramètres de la liste) :
 * indexable, utilisable sans JavaScript. Numéros en chasse fixe, page courante en pastille d'encre.
 */
export function Pagination({
  page,
  pageCount,
  hrefFor,
  label = "Pages de résultats",
  className,
}: {
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
  label?: string;
  className?: string;
}) {
  if (pageCount <= 1) return null;

  return (
    <nav aria-label={label} className={cn("border-border-default mt-16 flex justify-center border-t pt-8", className)}>
      <ul className="m-0 flex list-none flex-wrap items-center justify-center gap-1.5 p-0">
        <li className="mr-2">
          {page > 1 ? (
            <Link href={hrefFor(page - 1)} rel="prev" className={cn(base, arrow)}>
              <IconArrowLeft size={18} stroke={1.75} aria-hidden="true" />
              <span className="sr-only">Page précédente</span>
            </Link>
          ) : (
            <span className={cn(base, "border-border-default text-text-disabled border")} aria-hidden="true">
              <IconArrowLeft size={18} stroke={1.75} />
            </span>
          )}
        </li>
        {visiblePages(page, pageCount).map((item, index) =>
          item === "gap" ? (
            <li key={`gap-${index}`} aria-hidden="true" className="text-text-subtle px-1 font-mono">
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                href={hrefFor(item)}
                aria-current={item === page ? "page" : undefined}
                aria-label={`Page ${item}`}
                className={cn(base, item === page ? "bg-text-strong text-canvas" : idle)}
              >
                {String(item).padStart(2, "0")}
              </Link>
            </li>
          ),
        )}
        <li className="ml-2">
          {page < pageCount ? (
            <Link href={hrefFor(page + 1)} rel="next" className={cn(base, arrow)}>
              <IconArrowRight size={18} stroke={1.75} aria-hidden="true" />
              <span className="sr-only">Page suivante</span>
            </Link>
          ) : (
            <span className={cn(base, "border-border-default text-text-disabled border")} aria-hidden="true">
              <IconArrowRight size={18} stroke={1.75} />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
