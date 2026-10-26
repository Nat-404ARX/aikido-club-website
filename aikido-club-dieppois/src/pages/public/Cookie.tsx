import {
  Cookie,
  ShieldCheck,
  MapPin,
  SlidersHorizontal,
  ExternalLink,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCookieConsent } from "../../components/ui/CookieConsentContext.tsx";

function CookieSection({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Cookie;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
          <Icon size={20} aria-hidden="true" />
        </div>
        <h2 className="text-xl font-semibold text-neutral-900">{title}</h2>
      </div>
      <div className="space-y-3 text-sm leading-7 text-neutral-700 sm:text-base">
        {children}
      </div>
    </section>
  );
}

export default function Cookies() {
  const { consent, ready, saveConsent, reopenPreferences } =
    useCookieConsent();

  const [customizing, setCustomizing] = useState(false);
  const [functional, setFunctional] = useState(false);

  if (!ready || consent !== null) return null;

  return (
    <main className="min-h-screen bg-neutral-50 pb-16">
      <header className="bg-[#20282D] px-5 py-14 text-white sm:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#D5A46B]">
            Aïkido Club Dieppois / Confidentialité
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Politique des cookies
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-300 sm:text-base">
            Comprendre les traceurs utilisés sur le site et garder
            le contrôle sur vos préférences.
          </p>
          <div className="mt-7 h-1 w-12 rounded-full bg-[#D5A46B]" />
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-5 px-5 pt-8 sm:pt-12">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-7">
          <p className="text-sm leading-7 text-neutral-700 sm:text-base">
            Certains éléments techniques sont indispensables au fonctionnement
            du site. D'autres services, notamment les cartes interactives,
            peuvent communiquer avec des prestataires externes.
            Cette page explique ces catégories et les choix qui vous sont
            proposés.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="#necessaires"
              className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100"
            >
              Cookies nécessaires
            </a>
            <a
              href="#fonctionnels"
              className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100"
            >
              Services fonctionnels
            </a>
          </div>
        </div>

        <div id="necessaires">
          <CookieSection icon={ShieldCheck} title="Cookies nécessaires">
            <p>
              Ces éléments sont indispensables au fonctionnement du site
              et à la conservation de vos choix en matière de confidentialité.
              Ils ne peuvent pas être désactivés depuis les préférences
              lorsqu'ils sont strictement nécessaires au service demandé.
            </p>
            <p className="text-sm text-neutral-500">
              La liste précise des cookies et leur durée de conservation
              sera indiquée après vérification technique du site.
            </p>
          </CookieSection>
        </div>

        <div id="fonctionnels">
          <CookieSection icon={MapPin} title="Services fonctionnels">
            <h3 className="font-semibold text-neutral-900">Google Maps</h3>
            <p>
              Le site peut proposer une carte pour vous aider à localiser
              le lieu de pratique du club. Le chargement de cette carte
              peut transmettre certaines informations techniques à Google,
              telles que l'adresse IP et des informations relatives
              au navigateur.
            </p>
            <p>
              Lorsque votre consentement est requis, la carte interactive
              ne doit être chargée qu'après votre accord. Vous pouvez
              également consulter directement l'itinéraire sur le site
              de Google Maps.
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2">
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-950"
              >
                Confidentialité Google
                <ExternalLink size={14} aria-hidden="true" />
              </a>
              <a
                href="https://policies.google.com/technologies/cookies"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-950"
              >
                Informations sur les cookies Google
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            </div>
          </CookieSection>
        </div>

        <CookieSection
          icon={SlidersHorizontal}
          title="Gérer vos préférences"
        >
          <p>
            Vous devez pouvoir accepter ou refuser les traceurs soumis
            au consentement, puis modifier votre choix ultérieurement.
            Le refus ne doit pas empêcher l'accès aux autres contenus
            du site qui ne nécessitent pas ces traceurs.
          </p>
          <p>
            Utilisez le gestionnaire de consentement du site pour consulter
            vos choix et les modifier.
          </p>
          <p className="text-sm text-neutral-500">
            Le gestionnaire de consentement doit être relié au chargement
            effectif des services concernés pour que les préférences
            soient respectées.
          </p>
        </CookieSection>

        <nav
          aria-label="Autres informations juridiques"
          className="flex flex-wrap gap-x-6 gap-y-3 border-t border-neutral-200 pt-6 text-sm"
        >
          <Link
            to="/mention-legal"
            className="font-medium underline decoration-[#D5A46B] underline-offset-4"
          >
            Mentions légales
          </Link>
          <Link
            to="/confidentialite"
            className="font-medium underline decoration-[#D5A46B] underline-offset-4"
          >
            Politique de confidentialité
          </Link>
        </nav>
      </div>
    </main>
  );
}
