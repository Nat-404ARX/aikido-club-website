import { useEffect, useState } from "react";
import {
  Cookie,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";

const CONSENT_KEY = "aikido-club-cookie-consent";

type Consent = {
  necessary: true;
  functional: boolean;
  updatedAt: string;
};

function readConsent(): Consent | null {
  try {
    const saved = localStorage.getItem(CONSENT_KEY);
    if (!saved) return null;

    const parsed = JSON.parse(saved) as Partial<Consent>;

    if (typeof parsed.functional !== "boolean") return null;

    return {
      necessary: true,
      functional: parsed.functional,
      updatedAt: typeof parsed.updatedAt === "string"
        ? parsed.updatedAt
        : "",
    };
  } catch {
    return null;
  }
}

export function useCookieConsent() {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [ready, setReady] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [functional, setFunctional] = useState(false);

  useEffect(() => {
    setConsent(readConsent());
    setReady(true);
  }, []);

  const saveConsent = (functional: boolean) => {
    const next: Consent = {
      necessary: true,
      functional,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(CONSENT_KEY, JSON.stringify(next));
    setConsent(next);
  };

  const reopenPreferences = () => setConsent(null);

  return {
    consent,
    ready,
    saveConsent,
    reopenPreferences,
  };
}

export default function CookieConsent() {
  const {
    consent,
    ready,
    saveConsent,
  } = useCookieConsent();

  const [customizing, setCustomizing] = useState(false);
  const [functional, setFunctional] = useState(false);

  if (!ready || consent !== null) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-5"
      role="region"
      aria-label="Préférences des cookies"
    >
      <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#20282D] text-white shadow-2xl shadow-black/30">
        <div className="h-1 w-full bg-[#D5A46B]" />

        <div className="p-5 sm:p-7">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#D5A46B]">
              <Cookie size={22} aria-hidden="true" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D5A46B]">
                Votre confidentialité
              </p>
              <h2 className="mt-1 text-xl font-semibold">
                Vos choix, votre contrôle.
              </h2>
            </div>
          </div>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-neutral-300">
            Le site utilise les éléments nécessaires à son fonctionnement.
            Avec votre accord, nous pouvons également charger des services
            externes comme Google Maps. Vous pouvez accepter, refuser ou
            personnaliser votre choix.
          </p>

          <div className="mt-5 flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
            <ShieldCheck
              size={19}
              className="mt-0.5 shrink-0 text-[#D5A46B]"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-medium">Cookies nécessaires</p>
              <p className="mt-1 text-xs leading-5 text-neutral-400">
                Toujours actifs. Ils permettent notamment de mémoriser
                votre décision concernant les cookies.
              </p>
            </div>
            <span className="ml-auto shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-xs text-neutral-300">
              Activés
            </span>
          </div>

          {customizing && (
            <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-[#D5A46B]/40 bg-white/5 p-4">
              <input
                type="checkbox"
                checked={functional}
                onChange={(event) => setFunctional(event.target.checked)}
                className="mt-1 h-4 w-4 accent-[#D5A46B]"
              />
              <span>
                <span className="block text-sm font-medium">
                  Services fonctionnels
                </span>
                <span className="mt-1 block text-xs leading-5 text-neutral-400">
                  Autoriser le chargement de Google Maps et des services
                  associés lorsque cela est nécessaire.
                </span>
              </span>
            </label>
          )}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={() => saveConsent(true)}
              className="rounded-lg bg-[#D5A46B] px-5 py-3 text-sm font-semibold text-[#20282D] transition hover:bg-[#e3bb8e] focus:outline-none focus:ring-2 focus:ring-[#D5A46B] focus:ring-offset-2 focus:ring-offset-[#20282D]"
            >
              Tout accepter
            </button>

            <button
              type="button"
              onClick={() => saveConsent(false)}
              className="rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              Tout refuser
            </button>

            {customizing ? (
              <button
                type="button"
                onClick={() => saveConsent(functional)}
                className="rounded-lg border border-[#D5A46B]/50 px-5 py-3 text-sm font-semibold text-[#E8C69D] transition hover:bg-white/10"
              >
                Enregistrer mes choix
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCustomizing(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-neutral-300 transition hover:bg-white/10 hover:text-white"
              >
                <SlidersHorizontal size={16} aria-hidden="true" />
                Personnaliser
              </button>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-neutral-400">
            <a
              href="/mentions-legales"
              className="underline underline-offset-4 hover:text-white"
            >
              Mentions légales
            </a>
            <a
              href="/politique-confidentialite"
              className="underline underline-offset-4 hover:text-white"
            >
              Politique de confidentialité
            </a>
            <a
              href="/cookies"
              className="underline underline-offset-4 hover:text-white"
            >
              Politique des cookies
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Bouton à placer dans le pied de page pour rouvrir les préférences. */
export function CookiePreferencesButton() {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    setAvailable(true);
  }, []);

  const reopen = () => {
    localStorage.removeItem(CONSENT_KEY);
    window.dispatchEvent(new Event("cookie-preferences-reopen"));
  };

  if (!available) return null;

  return (
    <button
      type="button"
      onClick={reopen}
      className="inline-flex items-center gap-2 text-sm text-neutral-500 underline underline-offset-4 transition hover:text-neutral-900"
    >
      <Cookie size={15} aria-hidden="true" />
      Gérer les cookies
    </button>
  );
}
