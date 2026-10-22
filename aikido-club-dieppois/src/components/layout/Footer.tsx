import { Link } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUp, ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";


import { useClubInformation } from "../../hooks/useClubInformation.tsx";

const navLinks = [
  { key: "home", to: "/" },
  { key: "courses", to: "/cours" },
  { key: "schedule", to: "/horaires" },
  { key: "contact", to: "/contact" },
];

const legalLinks = [
  { key: "legal", to: "/mention-legal" },
  { key: "privacy", to: "/confidentialite" },
  { key: "cookies", to: "/cookies" },
  { key: "rules", to: "/reglement-interieur" },
  { key: "engagement", to: "/engagement" },
];

const associationInfo = [
  { key: "status", value: "Association loi 1901" },
  { key: "rna", value: "W000000000" },
  { key: "siret", value: "000 000 000 00000" },
  { key: "federation", value: "FFAAA" },
];

/* ------------------------------------------------------------------ */
export default function Footer() {
  const { t } = useTranslation();
  const { club, annualSchedule, loading, error } =
    useClubInformation();
  const link =
    "text-white/85 transition-colors duration-200 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

  return (
    <footer className="seigaiha-drift relative overflow-hidden bg-[var(--color-accent)] px-6 pb-8 pt-16 text-white">
      {/* Kanji en filigrane */}
      <span aria-hidden className="pointer-events-none absolute -bottom-16 right-[-2rem] select-none text-[16rem] font-semibold leading-none text-white/[0.06] sm:text-[22rem]">
        合気道
      </span>

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Marque */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-4">
              <span aria-hidden className="flex h-14 w-14 rotate-6 items-center justify-center rounded-lg bg-white text-3xl font-semibold text-[var(--color-accent)]">
                道
              </span>
              <p className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("hero.eyebrow")}</p>
            </div>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/85">{t("footer.tagline")}</p>

            <ul className="mt-6 flex flex-wrap gap-3">
              <li key={t(`details.channels.facebook`)}>
                <a href={club.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-sm font-medium transition-colors duration-300 hover:bg-white hover:text-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  {t(`details.channels.facebook`)}
                  <ArrowUpRight size={14} />
                </a>
              </li>
              <li key={t(`details.channels.instagram`)}>
                <a href={club.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-sm font-medium transition-colors duration-300 hover:bg-white hover:text-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  {t(`details.channels.instagram`)}
                  <ArrowUpRight size={14} />
                </a>
              </li>
              <li key={t(`details.channels.youtube`)}>
                <a href={club.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-sm font-medium transition-colors duration-300 hover:bg-white hover:text-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  {t(`details.channels.youtube`)}
                  <ArrowUpRight size={14} />
                </a>
              </li>
            </ul>
          </div>

          {/* Navigation */}
          <nav aria-label={t("footer.nav.title")} className="lg:col-span-2">
            <h2 className="text-sm font-semibold text-white/70">{t("footer.nav.title")}</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {navLinks.map((l) => (
                <li key={l.key}>
                  <Link to={l.to} className={link}>{t(`footer.nav.${l.key}`)}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Association */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-semibold text-white/70">{t("footer.info.title")}</h2>
            <dl className="mt-4 space-y-3 text-sm">
              {associationInfo.map((i) => (
                <div key={i.key}>
                  <dt className="text-white/70">{t(`footer.info.${i.key}`)}</dt>
                  <dd className="font-medium">{i.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h2 className="text-sm font-semibold text-white/70">{t("footer.contact.title")}</h2>
            <ul className="mt-4 space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0" aria-hidden />
                <a href={club.mapsUrl} target="_blank" rel="noopener noreferrer" className={link}>
                  {club.address.map((line) => (
                    <span key={line} className="block">{line}</span>
                  ))}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail size={18} className="shrink-0" aria-hidden />
                <a href={`mailto:${club.email}`} className={link}>{club.email}</a>
              </li>
              <li className="flex gap-3">
                <Phone size={18} className="shrink-0" aria-hidden />
                <a href={`tel:${club.phoneHref}`} className={link}>{club.phone}</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Barre légale */}
        <div className="mt-14 flex flex-col gap-6 border-t border-white/25 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-white/85">
            © {new Date().getFullYear()} {t("hero.eyebrow")}. {t("footer.rights")}
          </p>

          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legalLinks.map((l) => (
              <li key={l.key}>
                <Link to={l.to} className={link}>{t(`footer.legal.${l.key}`)}</Link>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group inline-flex items-center gap-3 self-start font-semibold sm:self-auto"
          >
            {t("footer.backToTop")}
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-white group-hover:text-[var(--color-accent)]">
              <ArrowUp size={16} />
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}