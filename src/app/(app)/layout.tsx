import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";

import { AppShell } from "@/components/app/shell/AppShell";

export const metadata: Metadata = {
  title: { default: "Espace agence", template: "%s · Espace agence Dahoo" },
  robots: { index: false },
};

export default function AppLayout({ children }: { children: ReactNode }) {
  // Suspense : les listes lisent leurs filtres dans l'URL (useSearchParams).
  return (
    <AppShell>
      <Suspense>{children}</Suspense>
    </AppShell>
  );
}
