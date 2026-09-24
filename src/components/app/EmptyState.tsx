import type { Icon } from "@tabler/icons-react";
import type { ReactNode } from "react";

/** Liste sans résultat ou module sans donnée : icône, titre, explication et action éventuelle. */
export function EmptyState({
  icon: EmptyIcon,
  title,
  children,
  action,
}: {
  icon: Icon;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="ax-empty">
      <EmptyIcon className="ax-empty__icon" stroke={1.5} aria-hidden="true" />
      <h2 className="ax-empty__title">{title}</h2>
      {children && <p className="m-0 max-w-md">{children}</p>}
      {action}
    </div>
  );
}
