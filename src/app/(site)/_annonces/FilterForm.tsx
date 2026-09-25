"use client";

import { IconArrowRight, IconChevronDown, IconSearch } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useTransition, type FormEvent, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { BEDROOM_CHOICES, DEFAULT_ORDERING, type Category, type ListingFilters } from "./filters";

export const FILTER_FORM_ID = "annonces-filtres";

/** Champs dont la valeur est un montant : les espaces de saisie (« 150 000 ») sont retirés. */
const AMOUNT_FIELDS = new Set(["min_price", "max_price"]);

/** Champ sans cadre : la cellule porte le filet, le champ ne garde que le texte. */
const control =
  "text-text-strong placeholder:text-text-subtle w-full min-w-0 appearance-none rounded-none border-0 bg-transparent p-0 text-base leading-snug outline-none";

/**
 * Cellule du formulaire : étiquette en chasse fixe au-dessus d'un champ nu, filet en bas.
 * Le focus se voit par un aplat sable et un filet d'encre plus épais.
 */
const cell =
  "border-border-default relative flex min-w-0 flex-col justify-end gap-2.5 border-b py-5 transition-colors duration-300 focus-within:shadow-[inset_0_-2px_0_0_var(--ax-text-strong)] sm:px-5 sm:focus-within:bg-surface-subtle";

function SelectChevron() {
  return (
    <IconChevronDown
      size={16}
      stroke={1.75}
      aria-hidden="true"
      className="text-text-muted pointer-events-none absolute right-0 bottom-[1.45rem] sm:right-5"
    />
  );
}

function Cell({ htmlFor, label, className, children }: { htmlFor: string; label: string; className?: string; children: ReactNode }) {
  return (
    <div className={cn(cell, className)}>
      <label htmlFor={htmlFor} className="site-label text-text-muted cursor-pointer">
        {label}
      </label>
      {children}
    </div>
  );
}

/**
 * Filtres des listes d'annonces : formulaire GET (fonctionne sans JavaScript, les filtres sont dans l'URL).
 * Avec JavaScript, la soumission est interceptée pour produire une URL propre (sans champs vides)
 * et naviguer sans rechargement complet.
 *
 * Présentation éditoriale : une grille de cellules séparées par des filets, sous un filet d'encre.
 * Mobile : replié dans un <details> (bouton « Filtrer », natif et accessible sans script).
 * Bureau (≥ lg) : toujours déplié — par CSS (::details-content) dès le premier affichage,
 * puis réellement ouvert au montage pour les technologies d'assistance et les navigateurs anciens.
 */
export function FilterForm({
  path,
  filters,
  cities,
  categories,
  activeCount,
  budgetHint,
}: {
  path: string;
  filters: ListingFilters;
  cities: string[];
  categories: { value: Category; label: string }[];
  activeCount: number;
  budgetHint: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 992px)"); // = breakpoint lg du thème (app.css)
    const sync = () => {
      if (desktop.matches && detailsRef.current) detailsRef.current.open = true;
    };
    sync();
    desktop.addEventListener("change", sync);
    return () => desktop.removeEventListener("change", sync);
  }, []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(event.currentTarget)) {
      if (typeof value !== "string") continue;
      const clean = AMOUNT_FIELDS.has(key) ? value.replace(/\D/g, "") : value.trim();
      if (clean) params.set(key, clean);
    }
    if (params.get("ordering") === DEFAULT_ORDERING) params.delete("ordering");
    const query = params.toString();
    startTransition(() => router.push(query ? `${path}?${query}` : path, { scroll: false }));
  }

  const bedroomChoices: number[] = [...BEDROOM_CHOICES];
  if (filters.min_bedrooms !== undefined && !bedroomChoices.includes(filters.min_bedrooms)) {
    bedroomChoices.push(filters.min_bedrooms);
  }
  const cityChoices = filters.city && !cities.includes(filters.city) ? [...cities, filters.city] : cities;

  return (
    <details
      ref={detailsRef}
      className="group border-text-strong border-t lg:[&::details-content]:[content-visibility:visible]"
    >
      <summary
        className={cn(
          "text-text-strong border-border-default flex min-h-16 cursor-pointer list-none items-center gap-4 border-b select-none",
          "focus-visible:outline-text-strong focus-visible:outline-2 focus-visible:outline-offset-4 [&::-webkit-details-marker]:hidden",
          "lg:group-open:hidden lg:supports-[selector(::details-content)]:hidden",
        )}
      >
        <span className="font-display text-2xl leading-none">Filtrer</span>
        {activeCount > 0 && (
          <span className="site-label text-accent-text">
            ({String(activeCount).padStart(2, "0")})
            <span className="sr-only"> {activeCount > 1 ? "filtres actifs" : "filtre actif"}</span>
          </span>
        )}
        <span className="site-label text-text-muted ml-auto group-open:hidden">Ouvrir</span>
        <span className="site-label text-text-muted ml-auto hidden group-open:inline">Replier</span>
        <IconChevronDown size={18} stroke={1.75} aria-hidden="true" className="text-text-muted transition-transform duration-500 group-open:rotate-180" />
      </summary>

      <form
        id={FILTER_FORM_ID}
        action={path}
        method="get"
        role="search"
        aria-label="Filtrer les annonces"
        onSubmit={onSubmit}
        className="grid sm:grid-cols-2 lg:grid-cols-12"
      >
        <Cell htmlFor="annonces-q" label="Recherche" className="sm:col-span-2 sm:pl-0 lg:col-span-6">
          <div className="flex items-center gap-3">
            <IconSearch size={18} stroke={1.75} aria-hidden="true" className="text-text-muted shrink-0" />
            <input
              id="annonces-q"
              name="q"
              type="search"
              defaultValue={filters.q ?? ""}
              maxLength={100}
              placeholder="Quartier, mot-clé… (ex. Almadies, piscine)"
              className={control}
            />
          </div>
        </Cell>

        <Cell htmlFor="annonces-city" label="Ville" className="sm:pl-0 lg:col-span-3 lg:border-l lg:pl-5">
          {cityChoices.length > 0 ? (
            <>
              <select id="annonces-city" name="city" defaultValue={filters.city ?? ""} className={cn(control, "cursor-pointer pr-6")}>
                <option value="">Toutes les villes</option>
                {cityChoices.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <SelectChevron />
            </>
          ) : (
            <input
              id="annonces-city"
              name="city"
              type="text"
              defaultValue={filters.city ?? ""}
              maxLength={80}
              placeholder="Ex. Dakar"
              className={control}
            />
          )}
        </Cell>

        <Cell htmlFor="annonces-category" label="Type de bien" className="sm:border-l lg:col-span-3">
          <select
            id="annonces-category"
            name="category"
            defaultValue={filters.category ?? ""}
            className={cn(control, "cursor-pointer pr-6")}
          >
            <option value="">Tous les types</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          <SelectChevron />
        </Cell>

        <fieldset className={cn(cell, "m-0 block sm:col-span-2 sm:pl-0 lg:col-span-6")}>
          <legend className="site-label text-text-muted float-left mb-2.5 w-full p-0">
            Budget <span className="text-text-subtle">· {budgetHint}</span>
          </legend>
          <div className="clear-both grid grid-cols-2 gap-6">
            <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-baseline sm:gap-3">
              <label htmlFor="annonces-min-price" className="text-text-muted shrink-0 text-sm">
                Minimum
              </label>
              <input
                id="annonces-min-price"
                name="min_price"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                defaultValue={filters.min_price ?? ""}
                placeholder="Sans minimum"
                className={cn(control, "font-mono text-[0.95rem] tabular-nums")}
              />
            </div>
            <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-baseline sm:gap-3">
              <label htmlFor="annonces-max-price" className="text-text-muted shrink-0 text-sm">
                Maximum
              </label>
              <input
                id="annonces-max-price"
                name="max_price"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                defaultValue={filters.max_price ?? ""}
                placeholder="Sans maximum"
                className={cn(control, "font-mono text-[0.95rem] tabular-nums")}
              />
            </div>
          </div>
        </fieldset>

        <Cell htmlFor="annonces-bedrooms" label="Chambres" className="sm:pl-0 lg:col-span-3 lg:border-l lg:pl-5">
          <select
            id="annonces-bedrooms"
            name="min_bedrooms"
            defaultValue={filters.min_bedrooms ?? ""}
            className={cn(control, "cursor-pointer pr-6")}
          >
            <option value="">Indifférent</option>
            {bedroomChoices.map((count) => (
              <option key={count} value={count}>
                {count} {count > 1 ? "chambres" : "chambre"} ou plus
              </option>
            ))}
          </select>
          <SelectChevron />
        </Cell>

        <div className="border-border-default flex items-center gap-6 border-b py-4 sm:border-l sm:pl-5 lg:col-span-3">
          <button
            type="submit"
            className={cn("ax-btn ax-btn--primary ax-btn--lg flex-1", pending && "is-loading")}
            aria-busy={pending || undefined}
          >
            <span className="ax-btn__label">Rechercher</span>
            <IconArrowRight className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
            <span className="ax-btn__spinner" aria-hidden="true" />
          </button>
          <Link href={path} scroll={false} className="site-link site-label text-text-muted hover:text-text-strong shrink-0 py-2">
            Effacer<span className="sr-only"> les filtres</span>
          </Link>
        </div>
      </form>
    </details>
  );
}
