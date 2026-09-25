"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { api } from "@/lib/api/client";
import { ApiError, unwrap } from "@/lib/api/errors";
import { SESSION_KEYS, useSession, type Me } from "@/lib/auth/useSession";
import {
  applyUi,
  cleanUi,
  clearUi,
  mergeUi,
  parseUi,
  readPersonalRaw,
  subscribeUi,
  writePersonal,
  type UiSettings,
} from "@/lib/uiTheme";

export type SaveState = "idle" | "saving" | "saved" | "error";
export type CustomizerScope = "personal" | "agency";

interface UiThemeValue {
  /** Apparence affichée : préférences personnelles par-dessus celle de l'agence. */
  effective: UiSettings;
  personal: UiSettings;
  agency: UiSettings;
  /** Administrateur d'une agence active : peut changer l'apparence de toute l'agence. */
  canEditAgency: boolean;
  setPersonal: (patch: UiSettings) => void;
  resetPersonal: () => void;
  setAgency: (patch: UiSettings) => void;
  resetAgency: () => void;
  agencySave: SaveState;
  /** Tiroir du personnaliseur : fermé (null) ou ouvert sur une portée. */
  customizer: CustomizerScope | null;
  openCustomizer: (scope?: CustomizerScope) => void;
  closeCustomizer: () => void;
}

const UiThemeContext = createContext<UiThemeValue | null>(null);
const SAVE_DELAY = 600;
const EMPTY: UiSettings = {};

/**
 * Applique l'apparence de l'espace connecté et expose le personnaliseur. Monté par AppShell : en
 * quittant l'espace (site public), le démontage retire tout pour revenir aux couleurs Dahoo.
 */
export function UiThemeProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { user, membership, can, isReadOnly } = useSession();
  const userId = user?.id;
  const orgId = membership?.organization_id;

  const personalRaw = useSyncExternalStore(
    subscribeUi,
    () => readPersonalRaw(userId),
    () => null,
  );
  const personal = useMemo(() => parseUi(personalRaw), [personalRaw]);
  const agency = membership?.organization_theme ?? EMPTY;
  const effective = useMemo(() => mergeUi(agency, personal), [agency, personal]);
  const effectiveKey = JSON.stringify(effective);

  // Tant que la session n'est pas chargée, on garde l'état posé par THEME_SCRIPT (pas de flash).
  useEffect(() => {
    if (userId === undefined) return;
    applyUi(JSON.parse(effectiveKey) as UiSettings);
  }, [effectiveKey, userId]);
  useEffect(() => clearUi, []);

  const setPersonal = useCallback(
    (patch: UiSettings) => {
      if (userId === undefined) return;
      writePersonal(userId, { ...parseUi(readPersonalRaw(userId)), ...patch });
    },
    [userId],
  );
  const resetPersonal = useCallback(() => {
    if (userId !== undefined) writePersonal(userId, {});
  }, [userId]);

  /* ── Apparence de l'agence : aperçu immédiat (cache de session), enregistrement différé ── */
  const [agencySave, setAgencySave] = useState<SaveState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const agencyRef = useRef(agency);
  useEffect(() => {
    agencyRef.current = agency;
  }, [agency]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const writeAgency = useCallback(
    (next: UiSettings) => {
      if (orgId === undefined) return;
      const theme = cleanUi(next);
      agencyRef.current = theme;
      queryClient.setQueryData<Me>(SESSION_KEYS.me, (me) =>
        me
          ? {
              ...me,
              memberships: me.memberships.map((item) =>
                item.organization_id === orgId ? { ...item, organization_theme: theme } : item,
              ),
            }
          : me,
      );
      setAgencySave("saving");
      clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        try {
          unwrap(
            await api.PATCH("/api/v1/organizations/current/", {
              body: { theme },
            }),
          );
          setAgencySave("saved");
          void queryClient.invalidateQueries({ queryKey: ["organization"] });
        } catch (error) {
          setAgencySave("error");
          // Le serveur fait foi : on recharge l'apparence réellement enregistrée.
          void queryClient.invalidateQueries({ queryKey: SESSION_KEYS.me });
          if (!(error instanceof ApiError)) throw error;
        }
      }, SAVE_DELAY);
    },
    [orgId, queryClient],
  );
  const setAgency = useCallback((patch: UiSettings) => writeAgency({ ...agencyRef.current, ...patch }), [writeAgency]);
  const resetAgency = useCallback(() => writeAgency({}), [writeAgency]);

  const canEditAgency = Boolean(membership) && !isReadOnly && can("organization.update");

  const [customizer, setCustomizer] = useState<CustomizerScope | null>(null);
  const openCustomizer = useCallback((scope: CustomizerScope = "personal") => setCustomizer(scope), []);
  const closeCustomizer = useCallback(() => setCustomizer(null), []);

  const value = useMemo(
    () => ({
      effective,
      personal,
      agency,
      canEditAgency,
      setPersonal,
      resetPersonal,
      setAgency,
      resetAgency,
      agencySave,
      customizer,
      openCustomizer,
      closeCustomizer,
    }),
    [
      effective,
      personal,
      agency,
      canEditAgency,
      setPersonal,
      resetPersonal,
      setAgency,
      resetAgency,
      agencySave,
      customizer,
      openCustomizer,
      closeCustomizer,
    ],
  );
  return <UiThemeContext.Provider value={value}>{children}</UiThemeContext.Provider>;
}

export function useUiTheme(): UiThemeValue {
  const value = useContext(UiThemeContext);
  if (!value) throw new Error("useUiTheme doit être utilisé dans <UiThemeProvider>.");
  return value;
}
