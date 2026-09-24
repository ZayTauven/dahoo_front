"use client";

import { IconMenu2, IconX } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { Container } from "./layout";

export const SITE_NAVIGATION = [
  { label: "Louer", href: "/louer" },
  { label: "Acheter", href: "/acheter" },
  { label: "Agences", href: "/agences" },
  { label: "Pour les agences", href: "/pour-les-agences" },
  { label: "Tarifs", href: "/tarifs" },
  { label: "Contact", href: "/contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Menu mobile : fermé à chaque navigation (état ajusté pendant le rendu, cf. doc React
  // « You Might Not Need an Effect ») et avec Échap.
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setOpen(false);
  }
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        "bg-canvas/90 sticky top-0 z-40 backdrop-blur transition-shadow",
        scrolled && "shadow-[0_8px_24px_-12px_rgba(20,27,71,0.18)]",
      )}
    >
      <Container className="flex h-[72px] items-center gap-6">
        <Link href="/" className="shrink-0" aria-label="Dahoo, accueil">
          <Image src="/brand/logo.png" alt="Dahoo" width={128} height={42} loading="eager" />
        </Link>

        <nav aria-label="Navigation principale" className="hidden flex-1 justify-center lg:flex">
          <ul className="m-0 flex list-none items-center gap-1 p-0">
            {SITE_NAVIGATION.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-2 text-[0.95rem] font-medium no-underline transition-colors",
                    isActive(item.href) ? "text-brand" : "text-text hover:text-brand",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <Link href="/connexion" className="ax-btn ax-btn--ghost">
            <span className="ax-btn__label">Espace agence</span>
          </Link>
          <Link href="/pour-les-agences#demo" className="ax-btn ax-btn--primary">
            <span className="ax-btn__label">Demander une démo</span>
          </Link>
        </div>

        <button
          type="button"
          className="ax-icon-btn ml-auto lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {open ? <IconX className="ax-icon" stroke={1.75} aria-hidden="true" /> : <IconMenu2 className="ax-icon" stroke={1.75} aria-hidden="true" />}
        </button>
      </Container>

      {open && (
        <div id="menu-mobile" className="border-border-default bg-canvas border-t lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            <nav aria-label="Navigation principale">
              <ul className="m-0 flex list-none flex-col p-0">
                {SITE_NAVIGATION.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={cn(
                        "block rounded-md px-3 py-3 text-base font-medium no-underline",
                        isActive(item.href) ? "text-brand bg-accent-wash" : "text-text-strong",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Link href="/connexion" className="ax-btn ax-btn--secondary ax-btn--block">
                <span className="ax-btn__label">Espace agence</span>
              </Link>
              <Link href="/pour-les-agences#demo" className="ax-btn ax-btn--primary ax-btn--block">
                <span className="ax-btn__label">Demander une démo</span>
              </Link>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
