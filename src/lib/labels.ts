/*
 * Libellés français et tonalités des énumérations de l'API (source : modèles Django).
 * Tonalité = variante de pastille .ax-badge (success, warning, danger, info, neutral, accent).
 */

export type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "accent";

export interface EnumEntry {
  label: string;
  tone: Tone;
}

export const UNIT_STATUS: Record<string, EnumEntry> = {
  FREE: { label: "Libre", tone: "success" },
  RENTED: { label: "Loué", tone: "info" },
  MAINTENANCE: { label: "En maintenance", tone: "warning" },
  SOLD: { label: "Vendu", tone: "neutral" },
};

export const UNIT_CATEGORY: Record<string, EnumEntry> = {
  APARTMENT: { label: "Appartement", tone: "neutral" },
  HOUSE: { label: "Maison / villa", tone: "neutral" },
  STUDIO: { label: "Studio", tone: "neutral" },
  OFFICE: { label: "Bureau", tone: "neutral" },
  SHOP: { label: "Local commercial", tone: "neutral" },
  LAND: { label: "Terrain", tone: "neutral" },
};

export const LEASE_STATUS: Record<string, EnumEntry> = {
  DRAFT: { label: "Brouillon", tone: "neutral" },
  ACTIVE: { label: "Actif", tone: "success" },
  TERMINATED: { label: "Résilié", tone: "warning" },
  COMPLETED: { label: "Terminé", tone: "info" },
  CANCELLED: { label: "Annulé", tone: "danger" },
};

export const PAYMENT_FREQUENCY: Record<string, EnumEntry> = {
  MONTHLY: { label: "Mensuel", tone: "neutral" },
  QUARTERLY: { label: "Trimestriel", tone: "neutral" },
};

export const SCHEDULE_TYPE: Record<string, EnumEntry> = {
  RENT: { label: "Loyer", tone: "neutral" },
  CHARGE: { label: "Charges", tone: "neutral" },
  SALE: { label: "Vente", tone: "neutral" },
};

export const LISTING_TYPE: Record<string, EnumEntry> = {
  RENT: { label: "Location", tone: "accent" },
  SALE: { label: "Vente", tone: "info" },
};

export const LISTING_STATUS: Record<string, EnumEntry> = {
  DRAFT: { label: "Brouillon", tone: "neutral" },
  PUBLISHED: { label: "Publiée", tone: "success" },
  SUSPENDED: { label: "Suspendue", tone: "warning" },
  CLOSED: { label: "Clôturée", tone: "danger" },
};

export const TICKET_STATUS: Record<string, EnumEntry> = {
  OPEN: { label: "Ouvert", tone: "info" },
  IN_PROGRESS: { label: "En cours", tone: "accent" },
  WAITING: { label: "En attente", tone: "warning" },
  RESOLVED: { label: "Résolu", tone: "success" },
  CLOSED: { label: "Clôturé", tone: "neutral" },
};

export const TICKET_PRIORITY: Record<string, EnumEntry> = {
  LOW: { label: "Basse", tone: "neutral" },
  MEDIUM: { label: "Moyenne", tone: "info" },
  HIGH: { label: "Haute", tone: "warning" },
  URGENT: { label: "Urgente", tone: "danger" },
};

export const SUBSCRIPTION_STATUS: Record<string, EnumEntry> = {
  ACTIVE: { label: "Actif", tone: "success" },
  SUSPENDED: { label: "Suspendu", tone: "warning" },
  EXPIRED: { label: "Expiré", tone: "danger" },
};

export const ACCESS_STATUS: Record<string, EnumEntry> = {
  ACTIVE: { label: "Abonnement actif", tone: "success" },
  TRIAL: { label: "Essai gratuit", tone: "accent" },
  EXPIRED: { label: "Lecture seule", tone: "danger" },
};

/** Options d'un <select> à partir d'une énumération. */
export function enumOptions(entries: Record<string, EnumEntry>) {
  return Object.entries(entries).map(([value, entry]) => ({ value, label: entry.label }));
}

export function enumLabel(entries: Record<string, EnumEntry>, value: string | null | undefined): string {
  if (!value) return "—";
  return entries[value]?.label ?? value;
}
