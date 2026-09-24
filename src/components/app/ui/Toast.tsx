"use client";

import { IconAlertTriangle, IconCircleCheck, IconInfoCircle, IconX } from "@tabler/icons-react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type Tone = "success" | "danger" | "info";

interface ToastItem {
  id: number;
  tone: Tone;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);
const ICONS = { success: IconCircleCheck, danger: IconAlertTriangle, info: IconInfoCircle };
const DURATION = 5000;

/** Notifications éphémères de l'espace agence (classes .ax-toast de Vireo), annoncées aux lecteurs d'écran. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => setItems((list) => list.filter((item) => item.id !== id)), []);
  const push = useCallback(
    (tone: Tone, message: string) => {
      const id = Date.now() + Math.random();
      setItems((list) => [...list.slice(-3), { id, tone, message }]);
      window.setTimeout(() => dismiss(id), DURATION);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => push("success", message),
      error: (message) => push("danger", message),
      info: (message) => push("info", message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="ax-toast-region ax-toast-region--bottom-end" aria-live="polite" aria-atomic="false">
        {items.map((item) => {
          const ToneIcon = ICONS[item.tone];
          return (
            <div key={item.id} className={`ax-toast ax-toast--${item.tone}`} role={item.tone === "danger" ? "alert" : "status"}>
              <ToneIcon className="ax-toast__icon" stroke={1.75} aria-hidden="true" />
              <div className="ax-toast__content">
                <p className="ax-toast__message">{item.message}</p>
              </div>
              <button type="button" className="ax-toast__dismiss" onClick={() => dismiss(item.id)} aria-label="Fermer la notification">
                <IconX stroke={1.75} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast doit être utilisé dans <ToastProvider>.");
  return value;
}
