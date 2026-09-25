import type { Viewport } from "next";
import type { ReactNode } from "react";

import { SiteMotion } from "@/components/site/motion";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

// Barre du navigateur mobile au sable du site (le site n'existe qu'en clair), cf. src/styles/site.css.
export const viewport: Viewport = { themeColor: "#F2EDE4" };

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <SiteMotion>
      <div className="site">
        <a className="ax-skip-link" href="#contenu">
          Aller au contenu
        </a>
        <SiteHeader />
        <main id="contenu">{children}</main>
        <SiteFooter />
      </div>
    </SiteMotion>
  );
}
