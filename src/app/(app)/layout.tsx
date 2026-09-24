import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppShell } from "@/components/app/shell/AppShell";

export const metadata: Metadata = {
  title: { default: "Espace agence", template: "%s · Espace agence Dahoo" },
  robots: { index: false },
};

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
