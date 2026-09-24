"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";

import { useTheme } from "@/components/providers/ThemeProvider";

import { AccessBanner } from "./AccessBanner";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

const MOBILE_QUERY = "(max-width: 767.98px)";

/**
 * Shell de l'espace agence (structure et classes du template Vireo).
 * Sous 768 px la sidebar devient un tiroir (data-ax-drawer="open" sur <html>, prévu par le CSS
 * Vireo mais non implémenté dans sa version Next) ; au-delà, le bouton replie la sidebar.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { toggleCollapsed } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const onMenu = () => {
    if (window.matchMedia(MOBILE_QUERY).matches) setDrawerOpen((open) => !open);
    else toggleCollapsed();
  };

  useEffect(() => {
    const root = document.documentElement;
    if (drawerOpen) {
      root.setAttribute("data-ax-drawer", "open");
      root.setAttribute("data-ax-scroll-lock", "");
    } else {
      root.removeAttribute("data-ax-drawer");
      root.removeAttribute("data-ax-scroll-lock");
    }
  }, [drawerOpen]);

  // Fermer le tiroir à chaque navigation (état ajusté pendant le rendu) et avec Échap.
  const [drawerPath, setDrawerPath] = useState(pathname);
  if (drawerPath !== pathname) {
    setDrawerPath(pathname);
    setDrawerOpen(false);
  }
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && closeDrawer();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, closeDrawer]);

  return (
    <>
      <div className="ax-ambient" aria-hidden="true">
        <i />
      </div>
      <a className="ax-skip-link" href="#contenu">
        Aller au contenu
      </a>
      <div className="ax-layout">
        <Sidebar />
        {drawerOpen && <button type="button" className="ax-backdrop" aria-label="Fermer le menu" onClick={closeDrawer} />}
        <div className="ax-shell">
          <Header onMenu={onMenu} />
          <main className="ax-main" id="contenu">
            <AccessBanner />
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
