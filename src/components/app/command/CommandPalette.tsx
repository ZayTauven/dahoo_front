"use client";

import { IconLoader2, IconSearch } from "@tabler/icons-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

import { useUiTheme } from "@/components/app/customizer/UiThemeProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { useSession } from "@/lib/auth/useSession";

import {
  actionItems,
  matchItems,
  pageItems,
  readRecent,
  recentItems,
  rememberRecent,
  resultItems,
  type CommandItem,
} from "./items";

const MIN_QUERY = 2;
const DEBOUNCE = 180;

function Palette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const session = useSession();
  const { resolved, toggleTheme } = useTheme();
  const { openCustomizer } = useUiTheme();
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  useFocusTrap(panelRef, true);

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [active, setActive] = useState(0);
  const [recent] = useState(readRecent);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), DEBOUNCE);
    return () => clearTimeout(timer);
  }, [query]);

  const hasAgency = Boolean(session.membership);
  const context = {
    can: session.can,
    isPlatformAdmin: session.isPlatformAdmin,
    hasAgency,
    isReadOnly: session.isReadOnly,
    dark: resolved === "dark",
    toggleTheme,
    openCustomizer: () => openCustomizer(),
  };
  const pages = pageItems(context);
  const actions = actionItems(context);

  const search = useQuery({
    queryKey: ["search", debounced, session.membership?.organization_id],
    queryFn: async () => unwrap(await api.GET("/api/v1/search/", { params: { query: { q: debounced } } })),
    enabled: hasAgency && debounced.length >= MIN_QUERY,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
  const searching = hasAgency && query.trim().length >= MIN_QUERY;
  const results = searching && search.data ? resultItems(search.data.results) : [];

  // Sans saisie : récents, actions, pages. Avec saisie : pages et actions dont le titre correspond,
  // puis les données de l'agence, puis ce qui n'est trouvé que par mot-clé.
  const matched = matchItems([...actions, ...pages], query);
  const items = query.trim()
    ? [...matched.strong, ...results, ...matched.weak]
    : [...recentItems(recent, pages), ...actions, ...pages];
  const current = Math.min(active, Math.max(items.length - 1, 0));

  // Garder la ligne active visible au clavier.
  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [current]);

  const choose = (item: CommandItem) => {
    rememberRecent(item);
    onClose();
    if (item.run) item.run();
    else if (item.href) router.push(item.href);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!items.length) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((current + step + items.length) % items.length);
    } else if (event.key === "Enter" && items[current]) {
      event.preventDefault();
      choose(items[current]);
    }
  };

  const optionId = (index: number) => `${listId}-${index}`;

  return (
    <div className="ax-command" onKeyDown={onKeyDown}>
      <button
        type="button"
        className="ax-command__backdrop"
        aria-label="Fermer la recherche"
        tabIndex={-1}
        onClick={onClose}
      />
      <div
        className="ax-command__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Rechercher ou aller à"
        ref={panelRef}
      >
        <div className="ax-command__input">
          {search.isFetching && searching ? (
            <IconLoader2 className="ax-icon animate-spin" stroke={1.75} aria-hidden="true" />
          ) : (
            <IconSearch className="ax-icon" stroke={1.75} aria-hidden="true" />
          )}
          <input
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={items.length ? optionId(current) : undefined}
            aria-autocomplete="list"
            aria-label="Rechercher un bien, un locataire, une page ou une action"
            placeholder={hasAgency ? "Bien, locataire, bail, page, action…" : "Page ou action…"}
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
          />
          <kbd className="ax-search__keycap">Échap</kbd>
        </div>

        <div className="ax-command__results" id={listId} role="listbox" aria-label="Suggestions" ref={listRef}>
          {items.length === 0 ? (
            <p className="ax-command__empty">
              {searching && search.isFetching ? "Recherche…" : `Aucun résultat pour « ${query.trim()} ».`}
            </p>
          ) : (
            items.map((item, index) => {
              const ItemIcon = item.icon;
              const heading = index === 0 || items[index - 1].group !== item.group;
              return (
                <div key={item.id} role="presentation">
                  {heading && (
                    <p className="ax-command__group" role="presentation">
                      {item.group}
                    </p>
                  )}
                  <div
                    id={optionId(index)}
                    role="option"
                    aria-selected={index === current}
                    className={`ax-command__row${index === current ? " is-active" : ""}`}
                    onMouseMove={() => index !== current && setActive(index)}
                    onClick={() => choose(item)}
                  >
                    <span className="ax-command__icon" aria-hidden="true">
                      <ItemIcon className="ax-icon" stroke={1.75} />
                    </span>
                    <span className="ax-command__text">
                      <span className="ax-command__row-title">{item.title}</span>
                      {item.subtitle && <span className="ax-command__subtitle">{item.subtitle}</span>}
                    </span>
                    {index === current && (
                      <kbd className="ax-search__keycap" aria-hidden="true">
                        Entrée
                      </kbd>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="ax-command__foot" aria-hidden="true">
          <span>
            <kbd className="ax-search__keycap">↑</kbd> <kbd className="ax-search__keycap">↓</kbd> naviguer
          </span>
          <span>
            <kbd className="ax-search__keycap">Entrée</kbd> ouvrir
          </span>
          {!hasAgency && <span>Recherche de données réservée à l&apos;espace agence</span>}
        </div>
      </div>
    </div>
  );
}

/** Palette de commandes (Ctrl+K / ⌘K), reprise de Vireo : pages, actions et recherche dans les données de l'agence. */
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  return open ? <Palette onClose={onClose} /> : null;
}
