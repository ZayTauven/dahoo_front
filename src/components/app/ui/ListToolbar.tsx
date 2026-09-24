"use client";

import { IconSearch } from "@tabler/icons-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Barre au-dessus d'une liste : recherche (appliquée 300 ms après la frappe), filtres et actions.
 * La recherche est pilotée par useListParams (valeur conservée dans l'URL).
 */
export function ListToolbar({
  search,
  onSearch,
  searchPlaceholder = "Rechercher…",
  filters,
  actions,
}: {
  search?: string;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  actions?: ReactNode;
}) {
  const [value, setValue] = useState(search ?? "");
  const timer = useRef<number | undefined>(undefined);

  // Réaligner le champ si la recherche change ailleurs (retour arrière, réinitialisation).
  const [lastSearch, setLastSearch] = useState(search);
  if (search !== lastSearch) {
    setLastSearch(search);
    setValue(search ?? "");
  }

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onChange = (next: string) => {
    setValue(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onSearch?.(next.trim()), 300);
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      {onSearch && (
        <div className="ax-field__control min-w-[220px] flex-1">
          <span className="ax-field__affix ax-field__affix--leading" aria-hidden="true">
            <IconSearch stroke={1.75} />
          </span>
          <input
            type="search"
            className="ax-input ax-input--with-leading-icon"
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        </div>
      )}
      {filters}
      {actions && <div className="ml-auto flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
