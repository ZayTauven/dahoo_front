"use client";

import { ORDERINGS, type Ordering } from "./filters";
import { FILTER_FORM_ID } from "./FilterForm";

/**
 * Tri des résultats. Rattaché au formulaire de filtres (attribut `form`) : il est envoyé avec les filtres,
 * et un changement soumet le formulaire immédiatement. Sans JavaScript, le bouton « Trier » prend le relais.
 */
export function SortSelect({ value }: { value: Ordering }) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="annonces-ordering" className="text-text-muted shrink-0 text-sm">
        Trier par
      </label>
      <select
        id="annonces-ordering"
        name="ordering"
        form={FILTER_FORM_ID}
        defaultValue={value}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="ax-select min-w-44"
      >
        {ORDERINGS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <noscript>
        <button type="submit" form={FILTER_FORM_ID} className="ax-btn ax-btn--secondary">
          <span className="ax-btn__label">Trier</span>
        </button>
      </noscript>
    </div>
  );
}
