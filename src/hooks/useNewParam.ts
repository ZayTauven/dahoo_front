"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

/**
 * Raccourci `?nouveau=1` (tableau de bord, palette de commandes) : ouvre la création d'un écran de
 * liste. `clear()` retire le paramètre à la fermeture, pour qu'un rechargement ne rouvre pas la fenêtre.
 */
export function useNewParam() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const requested = params.get("nouveau") === "1";

  const clear = useCallback(() => {
    if (!params.has("nouveau")) return;
    const next = new URLSearchParams(params.toString());
    next.delete("nouveau");
    const rest = next.toString();
    router.replace(rest ? `${pathname}?${rest}` : pathname, { scroll: false });
  }, [params, pathname, router]);

  return { requested, clear };
}
