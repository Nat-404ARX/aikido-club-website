import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import LanguageSwitcher from "../ui/LanguageSwitcher";

import {
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

const eventLinks = [
  { to: "/evenements", labelKey: "nav.allEvents" },
  // Ajouter ici les pages d'événements une fois définies.
];

const socialLinks = [
  {
    name: "Facebook",
    href: "", // Remplacer par l'URL officielle du club.
    icon: "facebook",
  },
  {
    name: "Instagram",
    href: "", // Remplacer par l'URL officielle du club.
    icon: "instagram",
  },
];

const mainLinks = [
  { to: "/club", labelKey: "nav.club" },
  { to: "/aikido", labelKey: "nav.aikido" },
  { to: "/cours", labelKey: "nav.courses" },
  { to: "/horaires", labelKey: "nav.schedule" },
  { to: "/contact", labelKey: "nav.contact" },
];


function SocialLinks() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      {socialLinks
        .filter((social) => social.href.trim() !== "")
        .map((social) => (
          <a
            key={social.name}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("nav.social", { name: social.name })}
            className="inline-flex size-10 items-center justify-center rounded-full transition-colors hover:bg-black/5 focus-visible:outline focus-visible:outline-2"
          >
            {social.icon === "facebook" ? (
              <svg
                viewBox="0 0 24 24"
                className="size-5"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H7.3v3h2.8v8h3.4Z" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            )}
          </a>
        ))}
    </div>
  );
}

function EventDropdown({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((previous) => !previous)}
        className="inline-flex min-h-10 items-center gap-1 rounded-md px-3 text-sm transition-colors hover:bg-black/5 focus-visible:outline focus-visible:outline-2"
      >
        {t("nav.events")}
        <ChevronDown
          aria-hidden="true"
          className={`size-4 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`absolute left-0 top-full z-50 min-w-56 pt-2 transition-all duration-200 ${
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-1 opacity-0"
        }`}
      >
        <div className="rounded-lg border border-black/10 bg-[#F2EFE8]/95 p-2 text-neutral-900 shadow-xl backdrop-blur-xl">
          {eventLinks.map((eventLink) => (
            <NavLink
              key={eventLink.to}
              to={eventLink.to}
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2.5 text-sm transition-colors ${
                  isActive ? "bg-black/10 font-semibold" : "hover:bg-black/5"
                }`
              }
            >
              {t(eventLink.labelKey)}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-neutral-950/10 text-neutral-900 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        {/* Logo */}
        <Link
          to="/"
          aria-label={t("nav.home")}
          className="flex shrink-0 items-center gap-3 rounded-md focus-visible:outline focus-visible:outline-2"
        >
          {/* Remplacer par le logo officiel quand il sera disponible */}
          <div className="flex size-13 items-center p-1 justify-center rounded-md bg-neutral-900 text-[#F2EFE8]">
            <img src={"/assets/icons/aikido-club-dieppois.avif"} alt="Aïkido Club Dieppois Logo"/>
          </div>

          <span className="leading-tight">
            <span className="block text-sm font-bold tracking-[0.12em] sm:text-base outline-white">
              AÏKIDO CLUB
            </span>
            <span className="block text-[10px] tracking-[0.24em] text-neutral-500 outline-white">
              DIEPPOIS
            </span>
          </span>
        </Link>

        {/* Navigation desktop */}
        <nav
          aria-label={t("nav.mainNavigation")}
          className="hidden items-center gap-1 lg:flex"
        >
          {mainLinks.slice(0, 2).map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-black/5 ${
                  isActive ? "font-semibold" : ""
                }`
              }
            >
              {t(link.labelKey)}
            </NavLink>
          ))}

          <EventDropdown />

          {mainLinks.slice(2).map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-black/5 ${
                  isActive ? "font-semibold" : ""
                }`
              }
            >
              {t(link.labelKey)}
            </NavLink>
          ))}
        </nav>

        {/* Réseaux et langue desktop */}
        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <SocialLinks />
          <div className="mx-1 h-6 w-px bg-black/10" />
          <LanguageSwitcher />
        </div>

        {/* Bouton burger mobile et tablette */}
        <button
          type="button"
          aria-label={mobileOpen ? t("nav.closeMenu") : t("nav.openMenu")}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMobileOpen((previous) => !previous)}
          className="inline-flex size-11 items-center justify-center rounded-md transition-colors hover:bg-black/5 focus-visible:outline focus-visible:outline-2 lg:hidden"
        >
          {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Panneau mobile */}
      <div
        className={`fixed inset-0 top-[76px] z-50 lg:hidden ${
          mobileOpen ? "visible" : "invisible pointer-events-none"
        }`}
      >
        <button
          type="button"
          aria-label={t("nav.closeMenu")}
          tabIndex={mobileOpen ? 0 : -1}
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-neutral-950/40 transition-opacity duration-300 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <nav
          id="mobile-navigation"
          aria-label={t("nav.mobileNavigation")}
          aria-hidden={!mobileOpen}
          inert={!mobileOpen}
          className={`absolute bottom-0 right-0 top-0 flex w-[min(88vw,380px)] h-[90vh] flex-col overflow-y-auto bg-[#F2EFE8] p-6 shadow-2xl transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            {t("nav.navigation")}
          </p>

          <div className="flex flex-col gap-1">
            {mainLinks.slice(0, 2).map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-3 text-base transition-colors ${
                    isActive ? "bg-black/10 font-semibold" : "hover:bg-black/5"
                  }`
                }
              >
                {t(link.labelKey)}
              </NavLink>
            ))}

            <div className="mt-2 border-y border-black/10 py-3">
              <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                {t("nav.events")}
              </p>

              {eventLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `block rounded-lg px-4 py-3 text-sm ${
                      isActive ? "bg-black/10 font-semibold" : "hover:bg-black/5"
                    }`
                  }
                >
                  {t(link.labelKey)}
                </NavLink>
              ))}
            </div>

            {mainLinks.slice(2).map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-3 text-base transition-colors ${
                    isActive ? "bg-black/10 font-semibold" : "hover:bg-black/5"
                  }`
                }
              >
                {t(link.labelKey)}
              </NavLink>
            ))}
          </div>

          <div className="mt-auto border-t border-black/10 pt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-500">
              {t("nav.followUs")}
            </p>

            <SocialLinks />

            <div className="mt-5">
              <LanguageSwitcher />
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
