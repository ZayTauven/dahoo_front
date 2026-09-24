import { IconPlus } from "@tabler/icons-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface FaqItem {
  question: string;
  answer: ReactNode;
}

/**
 * Questions fréquentes en accordéon natif (<details>/<summary>) : clavier, lecteurs d'écran et
 * recherche dans la page fonctionnent sans JavaScript. `name` n'ouvre qu'une réponse à la fois.
 * Reprend l'accordéon « Have a question? » des pages tarifs de Crafto.
 */
export function Faq({ items, name, className }: { items: FaqItem[]; name: string; className?: string }) {
  return (
    <div className={cn("border-border-default flex flex-col border-t", className)}>
      {items.map((item, index) => (
        <details key={item.question} name={name} open={index === 0} className="group border-border-default border-b">
          <summary
            className={cn(
              "text-text-strong flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-base font-semibold sm:text-lg",
              "focus-visible:outline-accent rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4",
              "[&::-webkit-details-marker]:hidden",
            )}
          >
            <span className="font-display">{item.question}</span>
            <span className="border-border-default group-open:bg-accent group-open:text-on-accent flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors group-open:border-transparent">
              <IconPlus size={16} stroke={2} aria-hidden="true" className="transition-transform duration-300 group-open:rotate-45" />
            </span>
          </summary>
          <div className="text-text-muted flex flex-col gap-3 pb-6 leading-relaxed sm:pr-12">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}
