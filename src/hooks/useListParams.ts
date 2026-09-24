"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

/**
 * Page, recherche et filtres d'une liste, conservés dans l'URL (partageables, conservés au retour
 * arrière). Changer un filtre ou la recherche revient à la page 1.
 *
 *   const list = useListParams(["status", "priority"]);
 *   api.GET("/api/v1/maintenance/tickets/", { params: { query: list.query } })
 */
export function useListParams<const Keys extends readonly string[]>(filterKeys: Keys) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const page = Math.max(1, Number(params.get("page")) || 1);
  const search = params.get("search") ?? "";
  const filters = useMemo(
    () => Object.fromEntries(filterKeys.map((key) => [key, params.get(key) ?? ""])) as Record<Keys[number], string>,
    [filterKeys, params],
  );

  const update = useCallback(
    (changes: Record<string, string | number | undefined>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value === undefined || value === "" || (key === "page" && Number(value) <= 1)) next.delete(key);
        else next.set(key, String(value));
      }
      if (!("page" in changes)) next.delete("page");
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  /** Paramètres prêts pour l'API (valeurs vides omises). */
  const query = useMemo(() => {
    const result: Record<string, string | number> = {};
    if (page > 1) result.page = page;
    if (search) result.search = search;
    for (const [key, value] of Object.entries(filters)) if (value) result[key] = value as string;
    return result;
  }, [page, search, filters]);

  return {
    page,
    search,
    filters,
    query,
    setPage: (value: number) => update({ page: value }),
    setSearch: (value: string) => update({ search: value }),
    setFilter: (key: Keys[number], value: string) => update({ [key]: value }),
    reset: () => router.replace(pathname, { scroll: false }),
  };
}
