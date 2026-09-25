import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * État vide ou indisponible d'une liste du site, en typographie : un filet, une phrase en serif,
 * une explication et, au besoin, une action. `role="status"` pour les pannes annoncées aux lecteurs d'écran.
 */
export function Notice({
  title,
  children,
  action,
  role,
  className,
}: {
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  role?: "status";
  className?: string;
}) {
  return (
    <div role={role} className={cn("border-border-default flex flex-col items-start gap-6 border-t pt-10", className)}>
      <p className="font-display text-text-strong m-0 max-w-2xl text-4xl leading-[1.02] tracking-tight text-balance sm:text-5xl">
        {title}
      </p>
      {children && <div className="text-text-muted m-0 max-w-md leading-relaxed">{children}</div>}
      {action}
    </div>
  );
}
