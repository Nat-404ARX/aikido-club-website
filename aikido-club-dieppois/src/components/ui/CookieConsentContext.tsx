import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const CONSENT_KEY = "aikido-club-cookie-consent";

export type CookieConsentValue = {
  necessary: true;
  functional: boolean;
};

type CookieConsentContextValue = {
  consent: CookieConsentValue | null;
  ready: boolean;
  saveConsent: (functional: boolean) => void;
  reopenPreferences: () => void;
};

const CookieConsentContext =
  createContext<CookieConsentContextValue | null>(null);

function readConsent(): CookieConsentValue | null {
  try {
    const saved = localStorage.getItem(CONSENT_KEY);
    if (!saved) return null;

    const parsed = JSON.parse(saved);

    if (typeof parsed.functional !== "boolean") return null;

    return {
      necessary: true,
      functional: parsed.functional,
    };
  } catch {
    return null;
  }
}

export function CookieConsentProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [consent, setConsent] = useState<CookieConsentValue | null>(null);
  const [ready, setReady] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    const saved = readConsent();
    setConsent(saved);
    setPreferencesOpen(saved === null);
    setReady(true);
  }, []);

  const saveConsent = (functional: boolean) => {
    const next: CookieConsentValue = {
      necessary: true,
      functional,
    };

    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({
        ...next,
        updatedAt: new Date().toISOString(),
      }),
    );

    setConsent(next);
    setPreferencesOpen(false);
  };

  const reopenPreferences = () => {
    setPreferencesOpen(true);
  };

  return (
    <CookieConsentContext.Provider
      value={{
        consent: preferencesOpen ? null : consent,
        ready,
        saveConsent,
        reopenPreferences,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);

  if (!context) {
    throw new Error(
      "useCookieConsent doit être utilisé dans CookieConsentProvider.",
    );
  }

  return context;
}
