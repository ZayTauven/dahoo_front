"use client";

import { IconArrowUpRight } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { Container } from "./layout";
import { EASE_OUT } from "./motion";

export const SITE_NAVIGATION = [
  { label: "Louer", href: "/louer" },
  { label: "Acheter", href: "/acheter" },
  { label: "Agences", href: "/agences" },
  { label: "Pour les agences", href: "/pour-les-agences" },
  { label: "Tarifs", href: "/tarifs" },
  { label: "Contact", href: "/contact" },
];

/** Pages dont le haut est une photo plein écran : l'en-tête y est transparent, en texte clair. */
const OVERLAY_PAGES = new Set(["/"]);

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);

  // Masqué quand on descend (la page respire), réaffiché dès qu'on remonte.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > 160 && y > lastY.current);
      lastY.current = y;
    };
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
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const overlayPage = OVERLAY_PAGES.has(pathname);
  const overlay = overlayPage && !scrolled && !open;

  return (
    <header
      className={cn(
        // Au-dessus d'une photo, l'en-tête flotte (fixed) ; ailleurs il réserve sa place (sticky).
        overlayPage ? "fixed inset-x-0" : "sticky",
        "top-0 z-50 transition-[transform,background-color,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        hidden && !open && "-translate-y-full",
        overlay
          ? "border-b border-transparent text-white"
          : "bg-canvas/85 border-border-default text-text-strong border-b backdrop-blur-md",
      )}
    >
      <Container className="relative z-10 flex h-[76px] items-center gap-8">
        <Link href="/" className="shrink-0" aria-label="Dahoo, accueil">
          <Image
            src="/brand/logo.png"
            alt="Dahoo"
            width={118}
            height={52}
            loading="eager"
            className={cn(overlay && "hidden")}
          />
          <Image
            src="/brand/logo-white.png"
            alt="Dahoo"
            width={118}
            height={52}
            loading="eager"
            className={cn(!overlay && "hidden")}
          />
        </Link>

        <nav aria-label="Navigation principale" className="hidden flex-1 lg:block">
          <ul className="m-0 flex list-none items-center gap-7 p-0">
            {SITE_NAVIGATION.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="site-link text-inherit py-1 text-[0.9rem]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto hidden items-center gap-6 lg:flex">
          <Link href="/connexion" className="site-link text-inherit py-1 text-[0.9rem]">
            Espace agence
          </Link>
          <Link
            href="/pour-les-agences#demo"
            className={cn(
              "group inline-flex h-11 items-center gap-2 rounded-full pr-2 pl-5 text-[0.9rem] font-medium no-underline transition-colors duration-500",
              overlay ? "bg-accent text-on-accent hover:bg-white" : "bg-text-strong text-canvas hover:bg-accent hover:text-on-accent",
            )}
          >
            Demander une démo
            <span className="bg-on-accent text-accent flex size-7 items-center justify-center rounded-full transition-transform duration-500 group-hover:rotate-45">
              <IconArrowUpRight size={16} stroke={2} aria-hidden="true" />
            </span>
          </Link>
        </div>

        <button
          type="button"
          className="site-label ml-auto flex h-11 items-center gap-3 text-inherit lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="menu-mobile"
        >
          {open ? "Fermer" : "Menu"}
          <span aria-hidden="true" className="relative block h-2.5 w-6">
            <span
              className={cn(
                "absolute left-0 h-px w-full bg-current transition-transform duration-500",
                open ? "top-1/2 rotate-45" : "top-0",
              )}
            />
            <span
              className={cn(
                "absolute left-0 h-px w-full bg-current transition-transform duration-500",
                open ? "top-1/2 -rotate-45" : "bottom-0",
              )}
            />
          </span>
        </button>
      </Container>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-mobile"
            className="bg-canvas text-text-strong fixed inset-0 flex flex-col pt-[76px] lg:hidden"
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.7, ease: EASE_OUT }}
          >
            <Container className="flex flex-1 flex-col justify-between gap-10 overflow-y-auto py-8">
              <nav aria-label="Navigation principale">
                <ul className="m-0 flex list-none flex-col p-0">
                  {SITE_NAVIGATION.map((item, index) => (
                    <li key={item.href} className="border-border-default overflow-hidden border-b">
                      <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: "0%" }}
                        transition={{ duration: 0.8, delay: 0.15 + index * 0.05, ease: EASE_OUT }}
                      >
                        <Link
                          href={item.href}
                          aria-current={isActive(item.href) ? "page" : undefined}
                          className="font-display flex items-baseline justify-between py-3 text-[2.6rem] leading-none text-inherit no-underline aria-[current=page]:italic"
                        >
                          {item.label}
                          <span className="site-label text-text-muted">{String(index + 1).padStart(2, "0")}</span>
                        </Link>
                      </motion.div>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link href="/pour-les-agences#demo" className="ax-btn ax-btn--primary ax-btn--lg ax-btn--block">
                  <span className="ax-btn__label">Demander une démo</span>
                </Link>
                <Link href="/connexion" className="ax-btn ax-btn--secondary ax-btn--lg ax-btn--block">
                  <span className="ax-btn__label">Espace agence</span>
                </Link>
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
