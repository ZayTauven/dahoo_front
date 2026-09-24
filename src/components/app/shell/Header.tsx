"use client";

import {
  IconBuildingStore,
  IconChevronDown,
  IconLogout,
  IconMenu2,
  IconMoon,
  IconSun,
  IconWorld,
} from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Dropdown } from "@/components/ui/Dropdown";
import { useTheme } from "@/components/providers/ThemeProvider";
import { setActiveOrganization } from "@/lib/api/client";
import { useSession } from "@/lib/auth/useSession";

function initials(first?: string, last?: string): string {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?";
}

export function Header({ onMenu }: { onMenu: () => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { resolved, toggleTheme } = useTheme();
  const { user, membership, memberships } = useSession();

  const switchOrganization = (organizationId: number) => {
    setActiveOrganization(organizationId);
    // Toutes les données dépendent de l'organisation active : on repart d'un cache vide.
    queryClient.clear();
    router.refresh();
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setActiveOrganization(null);
    queryClient.clear();
    router.replace("/connexion");
  };

  return (
    <header className="ax-header">
      <button type="button" className="ax-nav-toggle ax-icon-btn" onClick={onMenu} aria-label="Afficher ou masquer le menu">
        <IconMenu2 className="ax-icon" stroke={1.75} aria-hidden="true" />
      </button>

      {memberships.length > 1 ? (
        <Dropdown
          className="ax-lang"
          panelClassName="ax-dropdown"
          trigger={({ open, triggerProps }) => (
            <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" {...triggerProps} aria-expanded={open}>
              <IconBuildingStore className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
              <span className="ax-btn__label">{membership?.organization_name}</span>
              <IconChevronDown className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
            </button>
          )}
        >
          <p className="ax-dropdown__head">Changer d&apos;agence</p>
          {memberships.map((item) => (
            <button
              key={item.organization_id}
              type="button"
              role="menuitemradio"
              aria-checked={item.organization_id === membership?.organization_id}
              className={`ax-dropdown__item${item.organization_id === membership?.organization_id ? " is-active" : ""}`}
              onClick={() => switchOrganization(item.organization_id)}
            >
              {item.organization_name}
            </button>
          ))}
        </Dropdown>
      ) : (
        membership && <span className="ax-header__org">{membership.organization_name}</span>
      )}

      <span className="ax-header__spacer" />

      <Link className="ax-icon-btn" href="/" aria-label="Voir le site public" title="Voir le site public">
        <IconWorld className="ax-icon" stroke={1.75} aria-hidden="true" />
      </Link>

      <button
        type="button"
        className="ax-theme-toggle ax-icon-btn"
        onClick={toggleTheme}
        aria-pressed={resolved === "dark"}
        aria-label="Basculer le thème sombre"
      >
        {resolved === "dark" ? (
          <IconSun className="ax-icon" stroke={1.75} aria-hidden="true" />
        ) : (
          <IconMoon className="ax-icon" stroke={1.75} aria-hidden="true" />
        )}
      </button>

      <Dropdown
        className="ax-profile"
        panelClassName="ax-dropdown ax-profile__menu"
        trigger={({ open, triggerProps }) => (
          <button type="button" className="ax-profile__trigger" aria-label="Menu du compte" {...triggerProps} aria-expanded={open}>
            <span className="ax-avatar ax-avatar--sm ax-profile__avatar" aria-hidden="true">
              <span className="ax-avatar__initials">{initials(user?.first_name, user?.last_name)}</span>
            </span>
          </button>
        )}
      >
        <div className="ax-profile__card">
          <span className="ax-avatar" aria-hidden="true">
            <span className="ax-avatar__initials">{initials(user?.first_name, user?.last_name)}</span>
          </span>
          <span className="ax-profile__card-meta">
            <b>
              {user?.first_name} {user?.last_name}
            </b>
            <small>{membership?.role_label ?? user?.phone}</small>
          </span>
        </div>
        <div className="ax-dropdown__divider" role="separator" />
        <button type="button" className="ax-dropdown__item ax-dropdown__item--danger" role="menuitem" onClick={logout}>
          <IconLogout className="ax-icon" stroke={1.75} aria-hidden="true" /> Se déconnecter
        </button>
      </Dropdown>
    </header>
  );
}
