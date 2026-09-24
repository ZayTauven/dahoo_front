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
  "font-display inline-flex h-11 min-w-11 items-center justify-center rounded-full px-3 text-sm font-semibold no-underline transition-colors";
const idle = "text-text-strong hover:bg-(--ax-surface-solid) hover:text-brand";

/** Pagination par liens (`?page=`), indexable et utilisable sans JavaScript. */
export function Pagination({ page, pageCount, hrefFor }: { page: number; pageCount: number; hrefFor: (page: number) => string }) {
  if (pageCount <= 1) return null;

  return (
    <nav aria-label="Pages de résultats" className="mt-12 flex justify-center">
      <ul className="m-0 flex list-none flex-wrap items-center justify-center gap-1.5 p-0">
        <li>
          {page > 1 ? (
            <Link href={hrefFor(page - 1)} rel="prev" className={cn(base, idle)}>
              <IconArrowLeft size={18} stroke={2} aria-hidden="true" />
              <span className="sr-only">Page précédente</span>
            </Link>
          ) : (
            <span className={cn(base, "text-(--ax-text-disabled)")} aria-hidden="true">
              <IconArrowLeft size={18} stroke={2} />
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
                className={cn(base, item === page ? "bg-brand text-on-brand" : idle)}
              >
                {String(item).padStart(2, "0")}
              </Link>
            </li>
          ),
        )}
        <li>
          {page < pageCount ? (
            <Link href={hrefFor(page + 1)} rel="next" className={cn(base, idle)}>
              <IconArrowRight size={18} stroke={2} aria-hidden="true" />
              <span className="sr-only">Page suivante</span>
            </Link>
          ) : (
            <span className={cn(base, "text-(--ax-text-disabled)")} aria-hidden="true">
              <IconArrowRight size={18} stroke={2} />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
