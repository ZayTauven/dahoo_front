import type { Metadata } from "next";
import type { ReactNode } from "react";

import { PlatformGuard } from "./_components/PlatformGuard";

export const metadata: Metadata = {
  title: { default: "Plateforme Dahoo", template: "%s · Plateforme Dahoo" },
  robots: { index: false, follow: false },
};

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return <PlatformGuard>{children}</PlatformGuard>;
}
