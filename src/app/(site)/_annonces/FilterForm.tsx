"use client";

import { IconAdjustmentsHorizontal, IconChevronDown, IconRefresh, IconSearch } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useTransition, type FormEvent } from "react";

import { cn } from "@/lib/utils";

import { BEDROOM_CHOICES, DEFAULT_ORDERING, type Category, type ListingFilters } from "./filters";

export const FILTER_FORM_ID = "annonces-filtres";

/** Champs dont la valeur est un montant : les espaces de saisie (« 150 000 ») sont retirés. */
const AMOUNT_FIELDS = new Set(["min_price", "max_price"]);

const fieldLabel = "text-text-strong text-sm font-medium";

/**
 * Panneau de filtres : formulaire GET (fonctionne sans JavaScript, les filtres sont dans l'URL).
 * Avec JavaScript, la soumission est interceptée pour produire une URL propre (sans champs vides)
 * et naviguer sans rechargement complet.
 *
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
      className="group bg-(--ax-surface-solid) border-border-default relative z-10 rounded-2xl border shadow-[0_24px_60px_-32px_rgba(20,27,71,0.45)] lg:[&::details-content]:[content-visibility:visible]"
    >
      <summary
        className={cn(
          "text-text-strong flex min-h-14 cursor-pointer list-none items-center gap-3 rounded-2xl px-5 font-semibold select-none",
          "focus-visible:ring-accent focus-visible:ring-2 focus-visible:outline-none [&::-webkit-details-marker]:hidden",
          "lg:group-open:hidden lg:supports-[selector(::details-content)]:hidden",
        )}
      >
        <IconAdjustmentsHorizontal size={20} stroke={1.75} aria-hidden="true" className="text-brand" />
        <span>Filtrer</span>
        {activeCount > 0 && (
          <span className="bg-accent text-on-accent rounded-full px-2 py-0.5 text-xs font-bold">
            {activeCount}
            <span className="sr-only"> {activeCount > 1 ? "filtres actifs" : "filtre actif"}</span>
          </span>
        )}
        <IconChevronDown
          size={18}
          stroke={2}
          aria-hidden="true"
          className="text-text-muted ml-auto transition-transform group-open:rotate-180"
        />
      </summary>

      <form
        id={FILTER_FORM_ID}
        action={path}
        method="get"
        role="search"
        aria-label="Filtrer les annonces"
        onSubmit={onSubmit}
        className="border-border-default grid gap-4 border-t p-5 sm:grid-cols-2 lg:grid-cols-4 lg:border-t-0 lg:p-6"
      >
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="annonces-q" className={fieldLabel}>
            Recherche
          </label>
          <div className="relative">
            <IconSearch
              size={18}
              stroke={1.75}
              aria-hidden="true"
              className="text-text-subtle pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
            />
            <input
              id="annonces-q"
              name="q"
              type="search"
              defaultValue={filters.q ?? ""}
              maxLength={100}
              placeholder="Quartier, mot-clé… (ex. Almadies, piscine)"
              className="ax-input ax-input--lg pl-10"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="annonces-city" className={fieldLabel}>
            Ville
          </label>
          {cityChoices.length > 0 ? (
            <select id="annonces-city" name="city" defaultValue={filters.city ?? ""} className="ax-select ax-select--lg">
              <option value="">Toutes les villes</option>
              {cityChoices.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="annonces-city"
              name="city"
              type="text"
              defaultValue={filters.city ?? ""}
              maxLength={80}
              placeholder="Ex. Dakar"
              className="ax-input ax-input--lg"
            />
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="annonces-category" className={fieldLabel}>
            Type de bien
          </label>
          <select id="annonces-category" name="category" defaultValue={filters.category ?? ""} className="ax-select ax-select--lg">
            <option value="">Tous les types</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="m-0 grid min-w-0 grid-cols-2 gap-3 border-0 p-0 sm:col-span-2">
          <legend className={cn(fieldLabel, "mb-1.5 p-0")}>
            Budget <span className="text-text-muted font-normal">({budgetHint})</span>
          </legend>
          <div className="flex flex-col gap-1">
            <label htmlFor="annonces-min-price" className="text-text-muted text-xs">
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
              className="ax-input ax-input--lg"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="annonces-max-price" className="text-text-muted text-xs">
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
              className="ax-input ax-input--lg"
            />
          </div>
        </fieldset>

        <div className="flex flex-col gap-1.5 sm:self-end">
          <label htmlFor="annonces-bedrooms" className={fieldLabel}>
            Chambres
          </label>
          <select
            id="annonces-bedrooms"
            name="min_bedrooms"
            defaultValue={filters.min_bedrooms ?? ""}
            className="ax-select ax-select--lg"
          >
            <option value="">Indifférent</option>
            {bedroomChoices.map((count) => (
              <option key={count} value={count}>
                {count} {count > 1 ? "chambres" : "chambre"} ou plus
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 sm:self-end">
          <button
            type="submit"
            className={cn("ax-btn ax-btn--primary ax-btn--lg flex-1", pending && "is-loading")}
            aria-busy={pending || undefined}
          >
            <IconSearch className="ax-btn__icon" stroke={2} aria-hidden="true" />
            <span className="ax-btn__label">Rechercher</span>
            <span className="ax-btn__spinner" aria-hidden="true" />
          </button>
          <Link href={path} className="ax-btn ax-btn--secondary ax-btn--lg ax-btn--icon" aria-label="Réinitialiser les filtres" title="Réinitialiser les filtres">
            <IconRefresh className="ax-btn__icon" stroke={2} aria-hidden="true" />
          </Link>
        </div>
      </form>
    </details>
  );
}
