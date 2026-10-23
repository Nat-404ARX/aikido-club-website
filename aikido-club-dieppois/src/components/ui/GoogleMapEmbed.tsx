import { MapPin, ExternalLink } from "lucide-react";
import { useCookieConsent } from "./CookieConsentContext";
import { useClubInformation } from "../../hooks/useClubInformation.tsx"


export default function GoogleMapEmbed() {
  const { consent, ready, saveConsent } = useCookieConsent();
  const { club } = useClubInformation();

  const mapAllowed = ready && consent?.functional === true;

  const MINI_MAPS_URL = "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3055.0214600407216!2d1.099749366521027!3d49.91838955891624!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e0a39dac39b42d%3A0x8ffed2d8df3e17f3!2saikido club dieppe!5e0!3m2!1sfr!2sfr!4v1792756196450!5m2!1sfr!2sfr";
  //à corriger pour l'URL club.miniMapsUrl

  return (
    <div className="relative flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-[#f5f3ee] p-8 text-center">
      {mapAllowed ? (
        <iframe
          src={MINI_MAPS_URL}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Emplacement du dojo"
          className="absolute inset-0 h-full w-full min-h-[320px] rounded-2xl"
        />
      ) : (
        <div className="flex min-h-[350px] flex-col items-center justify-center px-6 py-10 text-center sm:min-h-[420px]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#20282D] text-[#D5A46B]">
            <MapPin size={26} aria-hidden="true" />
          </div>

          <h2 className="mt-5 text-xl font-semibold text-neutral-900">
            Afficher la carte
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-neutral-600">
            Cette carte est fournie par Google Maps. Pour l’afficher,
            autorisez les services fonctionnels. Vous pouvez aussi
            consulter la localisation directement sur Google Maps.
          </p>

          <button
            type="button"
            onClick={() => saveConsent(true)}
            className="mt-5 rounded-lg bg-[#20282D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#35434A] focus:outline-none focus:ring-2 focus:ring-[#D5A46B] focus:ring-offset-2"
          >
            Autoriser et afficher la carte
          </button>

          <a
              href={club.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-neutral-600 underline underline-offset-4 hover:text-neutral-950"
          >
            Ouvrir Google Maps
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
      )}
    </div>
  );
}
