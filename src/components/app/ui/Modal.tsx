"use client";

import { IconX } from "@tabler/icons-react";
import { useEffect, useId, useRef, type ReactNode } from "react";

import { useFocusTrap } from "@/hooks/useFocusTrap";

/**
 * Fenêtre modale (classes .ax-modal de Vireo) : focus piégé et rendu à la fermeture (useFocusTrap),
 * fermeture par Échap ou clic sur le fond. Rendue seulement quand `open` est vrai.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Pied de la modale (boutons). Pour un formulaire, placer <form> autour via FormModal. */
  footer?: ReactNode;
  size?: "sm" | "lg" | "xl";
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, open);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.setAttribute("data-ax-scroll-lock", "");
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      root.removeAttribute("data-ax-scroll-lock");
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="ax-modal ax-modal--centered" style={{ zIndex: 60 }}>
      <div className="ax-modal__backdrop" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        className={`ax-modal__dialog ax-modal__dialog--scrollable${size ? ` ax-modal__dialog--${size}` : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="ax-modal__header">
          <h2 className="ax-modal__title" id={titleId}>
            {title}
          </h2>
          <button type="button" className="ax-modal__close" onClick={onClose} aria-label="Fermer">
            <IconX stroke={1.75} aria-hidden="true" />
          </button>
        </div>
        {children}
        {footer && <div className="ax-modal__footer">{footer}</div>}
      </div>
    </div>
  );
}

/**
 * Modale contenant un formulaire : corps + boutons Annuler / Enregistrer, soumission au clavier,
 * bouton désactivé pendant l'envoi, message d'erreur général au-dessus des champs.
 */
export function FormModal({
  open,
  onClose,
  title,
  onSubmit,
  submitLabel = "Enregistrer",
  pending = false,
  error,
  children,
  size,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  onSubmit: () => void;
  submitLabel?: string;
  pending?: boolean;
  /** Message d'erreur général (ApiError.message quand il n'est lié à aucun champ). */
  error?: string;
  children: ReactNode;
  size?: "sm" | "lg" | "xl";
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size={size}>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (!pending) onSubmit();
        }}
      >
        <div className="ax-modal__body flex flex-col gap-4">
          {error && (
            <div className="ax-alert ax-alert--danger" role="alert">
              <div className="ax-alert__content">
                <p className="ax-alert__message">{error}</p>
              </div>
            </div>
          )}
          {children}
        </div>
        <div className="ax-modal__footer">
          <button type="button" className="ax-btn ax-btn--ghost" onClick={onClose}>
            <span className="ax-btn__label">Annuler</span>
          </button>
          <button type="submit" className={`ax-btn ax-btn--primary${pending ? " is-loading" : ""}`} disabled={pending} aria-busy={pending}>
            <span className="ax-btn__spinner" aria-hidden="true" />
            <span className="ax-btn__label">{submitLabel}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

/** Demande de confirmation avant une action irréversible (suppression, résiliation…). */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  children,
  confirmLabel = "Confirmer",
  danger = false,
  pending = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  pending?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button type="button" className="ax-btn ax-btn--ghost" onClick={onClose}>
            <span className="ax-btn__label">Annuler</span>
          </button>
          <button
            type="button"
            className={`ax-btn ${danger ? "ax-btn--danger" : "ax-btn--primary"}${pending ? " is-loading" : ""}`}
            onClick={onConfirm}
            disabled={pending}
            aria-busy={pending}
          >
            <span className="ax-btn__spinner" aria-hidden="true" />
            <span className="ax-btn__label">{confirmLabel}</span>
          </button>
        </>
      }
    >
      <div className="ax-modal__body text-text">{children}</div>
    </Modal>
  );
}
