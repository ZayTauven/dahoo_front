"use client";

import { IconSearch } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";

import { formatMoney } from "@/lib/format";
import { UNIT_CATEGORY } from "@/lib/labels";
import { cn } from "@/lib/utils";

type Mode = "RENT" | "SALE";

const MODES: { value: Mode; label: string; action: string }[] = [
  { value: "RENT", label: "Louer", action: "/louer" },
  { value: "SALE", label: "Acheter", action: "/acheter" },
];

/** Plafonds de budget proposés (FCFA), adaptés aux loyers mensuels et aux prix de vente au Sénégal. */
const BUDGETS: Record<Mode, number[]> = {
  RENT: [100_000, 200_000, 300_000, 500_000, 750_000, 1_000_000, 1_500_000, 2_500_000],
  SALE: [15_000_000, 25_000_000, 50_000_000, 75_000_000, 100_000_000, 150_000_000, 250_000_000, 500_000_000],
};

/** Critères transmis aux listes d'annonces (le choix Louer / Acheter donne la page cible). */
const FIELDS = ["city", "category", "max_price"] as const;

export interface SearchCity {
  city: string;
  listings_count: number;
}

const fieldLabel = "text-text-muted mb-1.5 block text-xs font-semibold tracking-wide uppercase";

/**
 * Recherche du hero : Louer / Acheter, ville, type de bien, budget maximum.
 * Formulaire GET classique (fonctionne sans JavaScript vers /louer) ; avec JavaScript,
 * on retire les champs vides de l'URL et on navigue côté client.
 */
export function SearchBar({ cities, className }: { cities: SearchCity[]; className?: string }) {
  const router = useRouter();
  const id = useId();
  const [mode, setMode] = useState<Mode>("RENT");
  const [budget, setBudget] = useState("");
  const action = MODES.find((item) => item.value === mode)?.action ?? "/louer";

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    const data = new FormData(event.currentTarget);
    for (const key of FIELDS) {
      const value = data.get(key);
      if (typeof value === "string" && value.trim() !== "") params.set(key, value.trim());
    }
    const query = params.toString();
    router.push(query ? `${action}?${query}` : action);
  };

  return (
    <form
      action={action}
      method="get"
      role="search"
      aria-label="Rechercher un bien"
      onSubmit={onSubmit}
      className={cn("w-full", className)}
    >
      <fieldset className="m-0 flex border-0 p-0">
        <legend className="sr-only">Je souhaite</legend>
        {MODES.map((item) => (
          <label key={item.value} className="cursor-pointer">
            <input
              type="radio"
              name="type"
              value={item.value}
              checked={mode === item.value}
              onChange={() => {
                setMode(item.value);
                setBudget("");
              }}
              className="peer sr-only"
            />
            <span
              className={cn(
                "font-display flex min-h-11 items-center rounded-t-lg px-6 text-base font-semibold transition-colors",
                "peer-focus-visible:outline-accent peer-focus-visible:outline-2 peer-focus-visible:-outline-offset-2",
                mode === item.value ? "bg-surface-solid text-text-strong" : "bg-brand-900/60 text-white hover:bg-brand-900/80",
              )}
            >
              {item.label}
            </span>
          </label>
        ))}
      </fieldset>

      <div className="bg-surface-solid grid gap-4 rounded-tr-xl rounded-b-xl p-4 shadow-[0_24px_60px_-30px_rgba(20,27,71,0.6)] sm:grid-cols-2 sm:p-5 lg:grid-cols-[1.2fr_1.2fr_1fr_auto] lg:items-end">
        <div>
          <label htmlFor={`${id}-city`} className={fieldLabel}>
            Ville
          </label>
          {cities.length > 0 ? (
            <select id={`${id}-city`} name="city" defaultValue="" className="ax-select ax-select--lg">
              <option value="">Toutes les villes</option>
              {cities.map((item) => (
                <option key={item.city} value={item.city}>
                  {`${item.city} (${item.listings_count})`}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={`${id}-city`}
              name="city"
              type="text"
              placeholder="Dakar, Saly, Thiès…"
              autoComplete="address-level2"
              className="ax-input ax-input--lg"
            />
          )}
        </div>

        <div>
          <label htmlFor={`${id}-category`} className={fieldLabel}>
            Type de bien
          </label>
          <select id={`${id}-category`} name="category" defaultValue="" className="ax-select ax-select--lg">
            <option value="">Tous les types</option>
            {Object.entries(UNIT_CATEGORY).map(([value, entry]) => (
              <option key={value} value={value}>
                {entry.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${id}-budget`} className={fieldLabel}>
            Budget max.
          </label>
          <select
            id={`${id}-budget`}
            name="max_price"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
            className="ax-select ax-select--lg"
          >
            <option value="">Sans limite</option>
            {BUDGETS[mode].map((amount) => (
              <option key={amount} value={amount}>
                {mode === "RENT" ? `${formatMoney(amount)} / mois` : formatMoney(amount)}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="ax-btn ax-btn--primary ax-btn--lg ax-btn--block lg:min-w-40">
          <IconSearch className="ax-btn__icon" stroke={2} aria-hidden="true" />
          <span className="ax-btn__label">Rechercher</span>
        </button>
      </div>
    </form>
  );
}
