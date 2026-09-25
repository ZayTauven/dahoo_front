"use client";

import { IconChevronDown } from "@tabler/icons-react";

import { ORDERINGS, type Ordering } from "./filters";
import { FILTER_FORM_ID } from "./FilterForm";

/**
 * Tri des résultats, en ligne éditoriale (« Trier par — Plus récents »). Rattaché au formulaire de
 * filtres (attribut `form`) : il est envoyé avec les filtres, et un changement soumet le formulaire
 * immédiatement. Sans JavaScript, le bouton « Trier » prend le relais.
 */
export function SortSelect({ value }: { value: Ordering }) {
  return (
    <div className="flex items-center gap-4">
      <label htmlFor="annonces-ordering" className="site-label text-text-muted shrink-0">
        Trier par
      </label>
      <div className="border-border-strong focus-within:border-text-strong relative border-b transition-colors">
        <select
          id="annonces-ordering"
          name="ordering"
          form={FILTER_FORM_ID}
          defaultValue={value}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
          className="text-text-strong focus-visible:outline-text-strong min-w-40 cursor-pointer appearance-none rounded-none border-0 bg-transparent py-1.5 pr-7 pl-0 text-[0.95rem] font-medium outline-none focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {ORDERINGS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <IconChevronDown
          size={16}
          stroke={1.75}
          aria-hidden="true"
          className="text-text-muted pointer-events-none absolute top-1/2 right-0 -translate-y-1/2"
        />
      </div>
      <noscript>
        <button type="submit" form={FILTER_FORM_ID} className="ax-btn ax-btn--secondary">
          <span className="ax-btn__label">Trier</span>
        </button>
      </noscript>
    </div>
  );
}
