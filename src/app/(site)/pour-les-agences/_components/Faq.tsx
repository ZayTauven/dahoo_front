import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface FaqItem {
  question: string;
  answer: ReactNode;
}

/**
 * Questions fréquentes en liste à filets, sur l'accordéon natif (<details>/<summary>) : clavier,
 * lecteurs d'écran et recherche dans la page fonctionnent sans JavaScript. `name` n'ouvre qu'une
 * réponse à la fois. Numéro en chasse fixe, question en serif, croix typographique qui pivote.
 */
export function Faq({ items, name, className }: { items: FaqItem[]; name: string; className?: string }) {
  return (
    <div className={cn("border-border-default flex flex-col border-t", className)}>
      {items.map((item, index) => (
        <details key={item.question} name={name} open={index === 0} className="group border-border-default border-b">
          <summary
            className={cn(
              "text-text-strong grid cursor-pointer list-none grid-cols-[2.25rem_1fr_auto] items-baseline gap-x-3 py-5 sm:grid-cols-[3rem_1fr_auto] sm:gap-x-4 sm:py-6",
              "focus-visible:outline-accent rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4",
              "[&::-webkit-details-marker]:hidden",
            )}
          >
            <span className="site-label text-text-muted group-open:text-accent-text transition-colors">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="font-display text-[1.4rem] leading-tight tracking-tight sm:text-[1.7rem]">{item.question}</span>
            <span
              aria-hidden="true"
              className="font-display text-text-muted group-hover:text-text-strong self-center text-3xl leading-none transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-open:rotate-45 sm:text-4xl"
            >
              +
            </span>
          </summary>
          <div
            className={cn(
              "text-text-muted flex max-w-2xl flex-col gap-3 pb-6 leading-relaxed",
              // Aligné sur la question : largeur de la colonne du numéro + gouttière.
              "pl-12 sm:pl-16",
              "[&_a]:text-text-strong [&_a]:underline [&_a]:underline-offset-4 [&_b]:font-medium",
            )}
          >
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
