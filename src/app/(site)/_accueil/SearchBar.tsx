"use client";

import { IconArrowRight, IconChevronDown } from "@tabler/icons-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent, type ReactNode } from "react";

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

const control =
  "text-text-strong w-full cursor-pointer appearance-none border-0 bg-transparent p-0 pr-6 text-base leading-snug outline-none";

/** Cellule de la barre : étiquette en chasse fixe au-dessus d'un champ sans bordure. */
function Field({ id, label, children, className }: { id: string; label: string; children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "focus-within:bg-surface-subtle relative flex min-w-0 flex-col gap-1 rounded-full px-5 py-2.5 transition-colors sm:py-3.5 lg:px-6",
        className,
      )}
    >
      <label htmlFor={id} className="site-label text-text-muted cursor-pointer">
        {label}
      </label>
      {children}
      <IconChevronDown
        size={16}
        stroke={1.75}
        aria-hidden="true"
        className="text-text-muted pointer-events-none absolute right-5 bottom-4 lg:right-6"
      />
    </div>
  );
}

/**
 * Recherche du hero : Louer / Acheter, ville, type de bien, budget maximum, dans une barre « papier ».
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
      className={cn("flex w-full flex-col gap-3", className)}
    >
      <fieldset className="m-0 flex self-start rounded-full border border-white/25 p-1 backdrop-blur-md">
        <legend className="sr-only">Je souhaite</legend>
        {MODES.map((item) => {
          const selected = mode === item.value;
          return (
            <label key={item.value} className="relative cursor-pointer">
              <input
                type="radio"
                name="type"
                value={item.value}
                checked={selected}
                onChange={() => {
                  setMode(item.value);
                  setBudget("");
                }}
                className="peer sr-only"
              />
              {selected && (
                <motion.span
                  layoutId="recherche-mode"
                  aria-hidden="true"
                  className="bg-surface-solid absolute inset-0 rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 34 }}
                />
              )}
              <span
                className={cn(
                  "relative flex h-9 items-center rounded-full px-5 text-sm font-medium transition-colors duration-300",
                  "peer-focus-visible:outline-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2",
                  selected ? "text-text-strong" : "text-white hover:text-white/80",
                )}
              >
                {item.label}
              </span>
            </label>
          );
        })}
      </fieldset>

      {/* Mobile : ville + bouton sur une ligne (type et budget se choisissent ensuite sur la liste). */}
      <div className="bg-surface-solid text-text-strong grid grid-cols-[1fr_auto] items-center overflow-hidden rounded-full p-1.5 shadow-[0_40px_80px_-40px_rgba(8,10,30,0.7)] sm:grid-cols-2 sm:rounded-3xl lg:grid-cols-[1.1fr_1.1fr_1fr_auto] lg:rounded-full">
        <Field id={`${id}-city`} label="Ville">
          {cities.length > 0 ? (
            <select id={`${id}-city`} name="city" defaultValue="" className={control}>
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
              className={cn(control, "cursor-text")}
            />
          )}
        </Field>

        <Field id={`${id}-category`} label="Type de bien" className="hidden sm:flex">
          <select id={`${id}-category`} name="category" defaultValue="" className={control}>
            <option value="">Tous les types</option>
            {Object.entries(UNIT_CATEGORY).map(([value, entry]) => (
              <option key={value} value={value}>
                {entry.label}
              </option>
            ))}
          </select>
        </Field>

        <Field id={`${id}-budget`} label="Budget max." className="hidden sm:flex">
          <select
            id={`${id}-budget`}
            name="max_price"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
            className={control}
          >
            <option value="">Sans limite</option>
            {BUDGETS[mode].map((amount) => (
              <option key={amount} value={amount}>
                {mode === "RENT" ? `${formatMoney(amount)} / mois` : formatMoney(amount)}
              </option>
            ))}
          </select>
        </Field>

        <div className="sm:col-span-2 sm:p-1 lg:col-span-1 lg:p-0">
          <button
            type="submit"
            aria-label="Rechercher"
            className="group bg-text-strong text-canvas hover:bg-accent hover:text-on-accent flex size-13 items-center justify-center gap-3 rounded-full text-base font-medium transition-colors duration-500 sm:h-14 sm:w-full sm:px-7 lg:h-15"
          >
            <span className="hidden sm:inline">Rechercher</span>
            <IconArrowRight
              size={18}
              stroke={1.75}
              aria-hidden="true"
              className="transition-transform duration-500 group-hover:translate-x-1"
            />
          </button>
        </div>
      </div>
    </form>
  );
}
