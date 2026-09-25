"use client";

import { IconPalette } from "@tabler/icons-react";

import { useUiTheme } from "@/components/app/customizer/UiThemeProvider";
import { ACCENT_PRESETS, UI_DEFAULTS } from "@/lib/uiTheme";

const SCHEME_LABELS = {
  light: "claire",
  dark: "sombre",
  brand: "couleur d'accent",
  gradient: "en dégradé",
  transparent: "transparente",
} as const;

const PAGE_LABELS = { regular: "pages en verre", classic: "pages opaques", compact: "pages denses" } as const;

/** Apparence de l'espace agence : résumé et accès au personnaliseur (portée agence pour les administrateurs). */
export function AppearanceCard() {
  const { agency, canEditAgency, openCustomizer } = useUiTheme();
  const theme = { ...UI_DEFAULTS, ...agency };
  const preset = ACCENT_PRESETS.find((item) => item.value === theme.accent);
  const accentColor = theme.accent === "custom" ? theme.accent_custom : preset?.base;
  const accentLabel =
    theme.accent === "custom" ? `Couleur libre ${theme.accent_custom ?? ""}` : (preset?.label ?? "Dahoo");

  return (
    <section className="ax-card" aria-labelledby="agence-apparence-titre">
      <div className="ax-card__header">
        <div className="ax-card__titles">
          <h2 id="agence-apparence-titre" className="ax-card__title flex items-center gap-2">
            <IconPalette className="text-accent-text size-5 shrink-0" stroke={1.75} aria-hidden="true" />
            Apparence
          </h2>
          <p className="ax-card__subtitle">
            {canEditAgency
              ? "Aux couleurs de votre agence, pour tous ses membres."
              : "Choisie par les administrateurs de l'agence."}
          </p>
        </div>
      </div>
      <div className="ax-card__body flex flex-col gap-4 pt-0">
        <div className="flex items-center gap-3">
          <span
            className="border-border-default size-9 shrink-0 rounded-full border"
            style={{ background: accentColor }}
            aria-hidden="true"
          />
          <span className="flex min-w-0 flex-col">
            <span className="text-text-strong text-sm font-semibold">{accentLabel}</span>
            <span className="text-text-muted text-xs">
              Barre latérale {SCHEME_LABELS[theme.sidebar]}, en-tête {SCHEME_LABELS[theme.header]},{" "}
              {PAGE_LABELS[theme.page]}
            </span>
          </span>
        </div>
        <button
          type="button"
          className="ax-btn ax-btn--secondary self-start"
          onClick={() => openCustomizer(canEditAgency ? "agency" : "personal")}
        >
          <IconPalette className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
          <span className="ax-btn__label">{canEditAgency ? "Personnaliser l'apparence" : "Adapter pour moi"}</span>
        </button>
      </div>
    </section>
  );
}
