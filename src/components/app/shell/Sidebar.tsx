"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { activeHref, NAVIGATION } from "@/components/app/navigation";
import { useSession } from "@/lib/auth/useSession";

export function Sidebar() {
  const pathname = usePathname() ?? "/espace";
  const { can, isPlatformAdmin, isLoading } = useSession();

  // Menu filtré selon les droits : on n'affiche pas une entrée qui répondrait 403.
  const sections = useMemo(
    () =>
      NAVIGATION.filter((section) => !section.platformOnly || isPlatformAdmin)
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => !item.capability || can(item.capability)),
        }))
        .filter((section) => section.items.length > 0),
    [can, isPlatformAdmin],
  );
  const current = activeHref(pathname, sections);

  return (
    <aside className="ax-sidebar" aria-label="Navigation principale">
      <div className="ax-sidebar__brand">
        <Link className="ax-sidebar__logo" href="/espace" aria-label="Dahoo, tableau de bord">
          <span className="ax-sidebar__mark" aria-hidden="true">
            <Image src="/brand/mark.png" alt="" width={28} height={28} priority />
          </span>
          <span className="ax-sidebar__wordmark">DAHOO</span>
        </Link>
      </div>

      <nav className="ax-sidebar__nav" aria-label="Menu" aria-busy={isLoading}>
        {sections.map((section) => (
          <div key={section.title}>
            <p className="ax-sidebar__section">{section.title}</p>
            {section.items.map((item) => {
              const active = item.href === current;
              const ItemIcon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`ax-nav__item ax-nav__item--single${active ? " ax-nav__item--active is-active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  <ItemIcon className="ax-nav__icon" stroke={1.75} aria-hidden="true" />
                  <span className="ax-nav__label">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
