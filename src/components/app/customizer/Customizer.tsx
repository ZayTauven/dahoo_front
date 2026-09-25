"use client";

import { IconCheck, IconX } from "@tabler/icons-react";
import { useRef, useState } from "react";

import { useTheme } from "@/components/providers/ThemeProvider";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import type { ThemeMode } from "@/lib/theme";
import { ACCENT_PRESETS, UI_DEFAULTS, type Scheme, type UiSettings } from "@/lib/uiTheme";

import { useUiTheme, type CustomizerScope, type SaveState } from "./UiThemeProvider";

const SCHEMES: [Scheme, string][] = [
  ["light", "Clair"],
  ["dark", "Sombre"],
  ["brand", "Couleur d'accent"],
  ["gradient", "Dégradé"],
  ["transparent", "Transparent"],
];

const SAVE_LABELS: Record<SaveState, string> = {
  idle: "Visible par tous les membres de l'agence.",
  saving: "Enregistrement…",
  saved: "Enregistré pour toute l'agence.",
  error: "Échec de l'enregistrement : l'apparence précédente est rétablie.",
};

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: [T, string][];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="ax-segmented" role="radiogroup" aria-label={label}>
      {options.map(([option, text]) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={value === option}
          className={`ax-segmented__btn${value === option ? " is-active" : ""}`}
          onClick={() => onChange(option)}
        >
          <span>{text}</span>
        </button>
      ))}
    </div>
  );
}

function SchemeRow({ label, value, onChange }: { label: string; value: Scheme; onChange: (value: Scheme) => void }) {
  return (
    <div className="ax-scheme-row" role="radiogroup" aria-label={label}>
      {SCHEMES.map(([scheme, text]) => (
        <button
          key={scheme}
          type="button"
          role="radio"
          aria-checked={value === scheme}
          aria-label={text}
          title={text}
          className={`ax-scheme ax-scheme--${scheme}${value === scheme ? " is-active" : ""}`}
          onClick={() => onChange(scheme)}
        />
      ))}
    </div>
  );
}

/** Couleur libre : sélecteur natif et saisie hexadécimale (appliquée dès qu'elle est valide). */
function CustomColor({ value, active, onChange }: { value: string; active: boolean; onChange: (hex: string) => void }) {
  const [draft, setDraft] = useState(value);
  const [source, setSource] = useState(value);
  if (source !== value) {
    setSource(value);
    setDraft(value);
  }
  const commit = (hex: string) => {
    setDraft(hex);
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) onChange(hex.toUpperCase());
  };
  return (
    <div className="ax-color-field">
      <span className="ax-color-field__label">
        {active ? "Couleur personnalisée (active)" : "Couleur personnalisée"}
      </span>
      <span className="ax-color-field__controls">
        <input
          type="color"
          className="ax-color-input"
          value={value}
          onChange={(event) => commit(event.target.value)}
          aria-label="Choisir une couleur personnalisée"
        />
        <input
          type="text"
          className="ax-hex"
          value={draft}
          maxLength={7}
          spellCheck={false}
          placeholder="#RRGGBB"
          onChange={(event) => commit(event.target.value.trim())}
          aria-label="Code hexadécimal de la couleur personnalisée"
        />
      </span>
    </div>
  );
}

function Panel({ initialScope, onClose }: { initialScope: CustomizerScope; onClose: () => void }) {
  const ref = useRef<HTMLElement>(null);
  useFocusTrap(ref, true);
  const { mode, setMode } = useTheme();
  const ui = useUiTheme();
  const [scope, setScope] = useState<CustomizerScope>(initialScope);
  const agencyScope = scope === "agency" && ui.canEditAgency;

  const values = {
    ...UI_DEFAULTS,
    ...(agencyScope ? ui.agency : ui.effective),
  };
  const set = (patch: UiSettings) => (agencyScope ? ui.setAgency(patch) : ui.setPersonal(patch));
  const reset = agencyScope ? ui.resetAgency : ui.resetPersonal;
  const hasPersonal = Object.keys(ui.personal).length > 0;
  const accentBase =
    values.accent === "custom" && values.accent_custom
      ? values.accent_custom
      : (ACCENT_PRESETS.find((preset) => preset.value === values.accent)?.base ?? ACCENT_PRESETS[0].base);

  return (
    <aside
      ref={ref}
      className="ax-customizer ax-customizer--enter"
      role="dialog"
      aria-modal="true"
      aria-labelledby="personnaliseur-titre"
      onKeyDown={(event) => event.key === "Escape" && onClose()}
    >
      <button type="button" className="ax-customizer__backdrop" onClick={onClose} aria-label="Fermer" tabIndex={-1} />

      <div className="ax-customizer__head">
        <div className="ax-customizer__head-text">
          <h2 id="personnaliseur-titre" className="ax-customizer__title">
            Apparence
          </h2>
          <p className="ax-customizer__sub">Aperçu en direct, enregistré automatiquement.</p>
        </div>
        <button
          type="button"
          className="ax-icon-btn ax-customizer__close"
          onClick={onClose}
          aria-label="Fermer l'apparence"
        >
          <IconX className="ax-icon" stroke={1.75} aria-hidden="true" />
        </button>
      </div>

      <div className="ax-customizer__body">
        {ui.canEditAgency && (
          <section className="ax-customizer__section">
            <p className="ax-eyebrow">Appliquer à</p>
            <Segmented<CustomizerScope>
              label="Portée des réglages"
              value={scope}
              onChange={setScope}
              options={[
                ["personal", "Moi seulement"],
                ["agency", "Toute l'agence"],
              ]}
            />
            <p className="ax-note" aria-live="polite">
              {agencyScope ? SAVE_LABELS[ui.agencySave] : "Sur cet appareil, par-dessus l'apparence de l'agence."}
            </p>
            {agencyScope && hasPersonal && (
              <p className="ax-note ax-note--warn">
                Vos préférences personnelles masquent une partie de ces réglages sur votre écran.{" "}
                <button type="button" className="ax-link font-medium underline" onClick={ui.resetPersonal}>
                  Les effacer
                </button>
              </p>
            )}
          </section>
        )}

        {!agencyScope && (
          <section className="ax-customizer__section">
            <p className="ax-eyebrow">Mode</p>
            <Segmented<ThemeMode>
              label="Mode de couleur"
              value={mode}
              onChange={setMode}
              options={[
                ["light", "Clair"],
                ["dark", "Sombre"],
                ["system", "Système"],
              ]}
            />
          </section>
        )}

        <section className="ax-customizer__section">
          <p className="ax-eyebrow">Couleur d&apos;accent</p>
          <div className="ax-swatch-grid" role="radiogroup" aria-label="Couleur d'accent">
            {ACCENT_PRESETS.map((preset) => {
              const active = values.accent === preset.value;
              return (
                <button
                  key={preset.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={preset.label}
                  title={preset.label}
                  className={`ax-swatch${active ? " is-active" : ""}`}
                  style={{ ["--sw" as string]: preset.base }}
                  onClick={() => set({ accent: preset.value, accent_custom: undefined })}
                >
                  {active && <IconCheck className="ax-swatch__check ax-icon" stroke={2.25} aria-hidden="true" />}
                </button>
              );
            })}
          </div>
          <CustomColor
            value={accentBase}
            active={values.accent === "custom"}
            onChange={(hex) => set({ accent: "custom", accent_custom: hex })}
          />
        </section>

        <section className="ax-customizer__section">
          <p className="ax-eyebrow">Barre latérale</p>
          <p className="ax-customizer__label">Couleur</p>
          <SchemeRow
            label="Couleur de la barre latérale"
            value={values.sidebar}
            onChange={(sidebar) => set({ sidebar })}
          />
          <p className="ax-customizer__label">Comportement</p>
          <Segmented
            label="Comportement de la barre latérale"
            value={values.sidebar_behavior}
            onChange={(sidebar_behavior) => set({ sidebar_behavior })}
            options={[
              ["collapsible", "Repliable"],
              ["expanded", "Dépliée"],
              ["compact", "Icônes"],
            ]}
          />
        </section>

        <section className="ax-customizer__section">
          <p className="ax-eyebrow">En-tête</p>
          <SchemeRow label="Couleur de l'en-tête" value={values.header} onChange={(header) => set({ header })} />
        </section>

        <section className="ax-customizer__section">
          <p className="ax-eyebrow">Disposition</p>
          <div className="ax-style-list ax-style-list--pair" role="radiogroup" aria-label="Style de la coque">
            {(
              [
                ["default", "Collée"],
                ["detached", "Détachée"],
              ] as const
            ).map(([shell, text]) => (
              <button
                key={shell}
                type="button"
                role="radio"
                aria-checked={values.shell === shell}
                className={`ax-style${values.shell === shell ? " is-active" : ""}`}
                onClick={() => set({ shell })}
              >
                <span className={`ax-style__diagram ax-style__diagram--${shell}`} aria-hidden="true" />
                <span className="ax-style__label">{text}</span>
              </button>
            ))}
          </div>
          <p className="ax-customizer__label">Style des pages</p>
          <Segmented
            label="Style des pages"
            value={values.page}
            onChange={(page) => set({ page })}
            options={[
              ["regular", "Verre"],
              ["classic", "Opaque"],
              ["compact", "Dense"],
            ]}
          />
          <p className="ax-customizer__label">Largeur</p>
          <Segmented
            label="Largeur du contenu"
            value={values.width}
            onChange={(width) => set({ width })}
            options={[
              ["fluid", "Aérée"],
              ["full", "Pleine largeur"],
            ]}
          />
        </section>
      </div>

      <div className="ax-customizer__foot">
        <button type="button" className="ax-btn ax-btn--ghost-danger" onClick={reset}>
          {agencyScope ? "Apparence Dahoo" : "Réinitialiser"}
        </button>
        <button type="button" className="ax-btn ax-btn--primary" onClick={onClose}>
          Terminé
        </button>
      </div>
    </aside>
  );
}

/** Personnaliseur d'apparence (tiroir latéral, repris de Vireo), ouvert via useUiTheme().openCustomizer. */
export function Customizer() {
  const { customizer, closeCustomizer } = useUiTheme();
  return customizer ? <Panel key={customizer} initialScope={customizer} onClose={closeCustomizer} /> : null;
}
