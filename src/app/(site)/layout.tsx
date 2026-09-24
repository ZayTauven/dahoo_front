import type { ReactNode } from "react";

import { SiteMotion } from "@/components/site/motion";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <SiteMotion>
      <a className="ax-skip-link" href="#contenu">
        Aller au contenu
      </a>
      <SiteHeader />
      <main id="contenu">{children}</main>
      <SiteFooter />
    </SiteMotion>
  );
}
