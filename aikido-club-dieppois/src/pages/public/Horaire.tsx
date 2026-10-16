import { useState } from "react";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowRight,
  CalendarDays,
  Clock3,
  FileText,
  Maximize2,
  Users,
  MapPin,
  X,
} from "lucide-react";
import ScrollReveal from "../../components/ui/ScrollReveal";
import { useTranslation } from "react-i18next";

const weeklySchedule = [
  {
    day: "Lundi",
    short: "LUN",
    courses: [
      {
        time: "À compléter",
        name: "Aïki Taïso",
        audience: "Tous publics",
        detail: "Préparation physique",
      },
      {
        time: "À compléter",
        name: "Cours thématique",
        audience: "À confirmer",
        detail: "Thème différent chaque mois",
      },
    ],
  },
  {
    day: "Mardi",
    short: "MAR",
    courses: [],
  },
  {
    day: "Mercredi",
    short: "MER",
    courses: [
      {
        time: "De 17h 30 à 18h 30",
        name: "Cours adultes",
        audience: "Adultes",
        detail: "Aïkido",
      },
      {
        time: "À compléter",
        name: "Cours d’armes",
        audience: "Adultes",
        detail: "Armes",
      },
      {
        time: "À compléter",
        name: "Cours enfants",
        audience: "Enfants",
        detail: "Aïkido",
      },
    ],
  },
  {
    day: "Jeudi",
    short: "JEU",
    courses: [],
  },
  {
    day: "Vendredi",
    short: "VEN",
    courses: [
      {
        time: "À compléter",
        name: "Cours adultes",
        audience: "Adultes",
        detail: "Aïkido",
      },
    ],
  },
  {
    day: "Samedi",
    short: "SAM",
    courses: [],
  },
  {
    day: "Dimanche",
    short: "DIM",
    courses: [],
  },
] as const;

const annualSchedule = {
  season: "2026-2027",
  image: "/assets/images/horaires/planning-annuel.jpg",
  pdf: "",
};

const pricing = {
  season: "2026-2027",
  pdf: "/documents/tarifs/tarifs2026-2027.pdf",
  plans: [
    {
      key: "adult",
      name: "Adulte",
      price: null as number | null,
      description: "",
    },
    {
      key: "child",
      name: "Enfant",
      price: null as number | null,
      description: "",
    },
  ],
};

function getCurrentDayIndex() {
  // JavaScript : dimanche = 0, lundi = 1, etc.
  return (new Date().getDay() + 6) % 7;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(price);
}

export default function HorairesTarifs() {
  const [selectedDay, setSelectedDay] = useState(getCurrentDayIndex);
  const [showAnnualImage, setShowAnnualImage] = useState(false);
  const [annualImageAvailable, setAnnualImageAvailable] = useState(true);

  const todayIndex = getCurrentDayIndex();
  const currentDay = weeklySchedule[selectedDay];

  const { t } = useTranslation();

  return (
    <main className="overflow-hidden bg-[#f5f3ee] text-neutral-950">
      {/* INTRODUCTION */}
      <section className="px-6 pb-16 pt-28 sm:pb-20 sm:pt-36 lg:pt-44">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
              {t("horaire.about")}
            </p>

            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-8xl">
              {t("horaire.hours")} <span className="text-neutral-400">&</span> {t("horaire.tarifs")}
            </h1>

            <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg">
                {t("horaire.intro")}
              </p>

              <a
                href="#horaires"
                className="group inline-flex items-center gap-3 text-sm font-semibold"
              >
                {t("horaire.checkHour")}
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 transition-all duration-300 group-hover:border-neutral-950 group-hover:bg-neutral-950 group-hover:text-white">
                  <ArrowDown size={18} />
                </span>
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* HORAIRES HEBDOMADAIRES */}
      <section
        id="horaires"
        className="scroll-mt-20 bg-white px-6 py-20 sm:py-28 lg:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
                  {t("horaire.eachWeek")}
                </p>
                <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                  {t("horaire.classHours")}
                </h2>
              </div>

              <p className="max-w-md text-sm leading-relaxed text-neutral-500">
                {t("horaire.selectedDay")}
              </p>
            </div>
          </ScrollReveal>

          {/* SÉLECTEUR DES JOURS */}
          <div className="mt-10 grid grid-cols-4 gap-2 sm:grid-cols-7 sm:gap-3">
            {weeklySchedule.map((day, index) => {
              const isToday = index === todayIndex;
              const isSelected = index === selectedDay;

              return (
                <button
                  key={day.short}
                  type="button"
                  onClick={() => setSelectedDay(index)}
                  aria-pressed={isSelected}
                  className={`relative flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border px-2 py-3 transition-all duration-300 sm:min-h-24 ${isSelected
                      ? "border-neutral-950 bg-neutral-950 text-white"
                      : "border-neutral-200 bg-[#f8f7f4] text-neutral-700 hover:border-neutral-400"
                    } ${isToday
                      ? "ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-white shadow-[0_0_22px_color-mix(in_srgb,var(--color-accent)_22%,transparent)]"
                      : ""
                    }`}
                >
                  {isToday && (
                    <span
                      className={`absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--color-accent)] ${isSelected
                          ? "shadow-[0_0_10px_var(--color-accent)]"
                          : ""
                        }`}
                      aria-label="Aujourd’hui"
                    />
                  )}

                  <span className="text-lg font-medium">
                    {day.day}
                  </span>

                  {isToday && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider">
                      {t("horaire.today")}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* DÉTAILS DU JOUR */}
          <div className="mt-8 rounded-2xl border border-neutral-200 bg-[#f8f7f4] p-5 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                  {t("horaire.plan")}
                </p>
                <h3 className="mt-2 text-2xl font-semibold">
                  {currentDay.day}
                </h3>
              </div>

              {selectedDay === todayIndex && (
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 px-3 py-2 text-xs font-semibold text-neutral-800">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-accent)] shadow-[0_0_10px_var(--color-accent)]" />
                  {t("horaire.today")}
                </span>
              )}
            </div>

            <div className="mt-6 space-y-3">
              {currentDay.courses.length > 0 ? (
                currentDay.courses.map((course, index) => (
                  <article
                    key={`${course.name}-${index}`}
                    className="group flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition-all duration-300 hover:border-neutral-400 hover:shadow-md sm:flex-row sm:items-center sm:p-5"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-neutral-950 text-white transition-colors group-hover:bg-[var(--color-accent)]">
                      <Clock3 size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold">{course.name}</h4>
                      <p className="mt-1 text-sm text-neutral-500">
                        {course.detail}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="inline-flex items-center gap-2 text-neutral-600">
                        <Users size={16} />
                        {course.audience}
                      </span>

                      <span className="rounded-md bg-neutral-100 px-3 py-2 font-semibold text-neutral-800">
                        {course.time}
                      </span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <CalendarDays
                    size={28}
                    className="text-neutral-400"
                  />
                  <p className="mt-4 font-medium">
                    {t("horaire.noclass")}
                    
                  </p>
                  <p className="mt-2 text-sm text-neutral-500">
                    
                    {t("horaire.checkYear")}
                  </p>
                </div>
              )}
            </div>

            <p className="mt-5 text-xs leading-relaxed text-neutral-500">
              {t("horaire.confirmHours")}
            </p>
          </div>
        </div>
      </section>

      {/* PLANNING ANNUEL */}
      <section className="bg-neutral-950 px-6 py-20 text-white sm:py-28 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
                  
                  {t("horaire.seasonCalendar")}
                </p>
                <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                  
                  {t("horaire.yearCalendar")}
                </h2>
                <p className="mt-4 text-sm text-white/60">
                  {t("horaire.season")} {annualSchedule.season}
                </p>
              </div>

              {annualSchedule.pdf && (
                <a
                  href={annualSchedule.pdf}
                  download
                  className="inline-flex min-h-12 items-center justify-center gap-3 border border-white/20 px-5 py-3 text-sm font-semibold transition-colors hover:border-white hover:bg-white hover:text-neutral-950"
                >
                  <ArrowDownToLine size={18} />
                  
                  {t("horaire.downloadCalendar")}
                </a>
              )}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="mt-10 overflow-hidden rounded-xl border border-white/15 bg-white/[0.04]">
              {annualImageAvailable ? (
                <button
                  type="button"
                  onClick={() => setShowAnnualImage(true)}
                  className="group relative block w-full cursor-zoom-in text-left"
                  aria-label="Agrandir le planning annuel"
                >
                  <img
                    src={annualSchedule.image}
                    alt={`Planning annuel de l’Aïkido Club Dieppois, saison ${annualSchedule.season}`}
                    className="mx-auto max-h-[850px] w-full object-contain transition-opacity duration-300 group-hover:opacity-90"
                    onError={() => setAnnualImageAvailable(false)}
                  />
                  <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-lg bg-neutral-950/90 px-4 py-3 text-sm font-medium text-white backdrop-blur">
                    <Maximize2 size={16} />
                    
                    {t("horaire.maximize")}
                  </span>
                </button>
              ) : (
                <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center sm:min-h-[420px]">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/15 text-white/50">
                    <CalendarDays size={28} />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold">
                    
                      {t("horaire.addCalendar")}
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-white/55">
                    
                      {t("horaire.soonCalendar")}
                  </p>
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* TARIFS */}
      <section
        id="tarifs"
        className="scroll-mt-20 bg-[#f5f3ee] px-6 py-20 sm:py-28 lg:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
                  
                  {t("horaire.joinClub")}
                </p>
                <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                  
                  {t("horaire.tarif")}
                </h2>
                <p className="mt-4 text-sm text-neutral-500">
                  {t("horaire.season")} {pricing.season}
                </p>
              </div>

              <div className="flex items-center gap-3 text-sm text-neutral-500">
                <FileText size={20} />
                
                {t("horaire.officialDoc")}
              </div>
            </div>
          </ScrollReveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {pricing.plans.map((plan, index) => (
              <ScrollReveal key={plan.key} delay={index * 100}>
                <article className="h-full rounded-2xl border border-neutral-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-neutral-400 hover:shadow-lg sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                        
                        {t("horaire.formule")}
                      </p>
                      <h3 className="mt-3 text-2xl font-semibold">
                        {plan.name}
                      </h3>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100">
                      <Users size={22} />
                    </div>
                  </div>

                  <div className="mt-8">
                    {plan.price !== null ? (
                      <p className="text-4xl font-semibold tracking-tight">
                        {formatPrice(plan.price)}
                      </p>
                    ) : (
                      <p className="text-3xl font-semibold tracking-tight text-neutral-300">
                        — €
                      </p>
                    )}
                  </div>

                  {plan.description && (
                    <p className="mt-4 text-sm leading-relaxed text-neutral-600">
                      {plan.description}
                    </p>
                  )}
                </article>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={150}>
            <div className="mt-8 flex flex-col items-start justify-between gap-6 rounded-2xl bg-neutral-950 p-6 text-white sm:flex-row sm:items-center sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <FileText size={22} />
                </div>

                <div>
                  <h3 className="text-lg font-semibold">
                    
                    {t("horaire.allTarif")}
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60">
                    
                    {t("horaire.joinCondition")}
                  </p>
                </div>
              </div>

              <a
                href={pricing.pdf}
                download
                className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 bg-white px-5 py-3 text-sm font-semibold text-neutral-950 transition-colors hover:bg-[var(--color-accent)] hover:text-white"
              >
                <ArrowDownToLine size={18} />
                
                {t("horaire.downloadPDF")}
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>


      {/* LOCALISATION DU DOJO */}
      <section className="bg-white px-6 py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
              {t("location.eyebrow")}
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              {t("location.title")}
            </h2>

            <p className="mt-5 max-w-lg leading-relaxed text-neutral-600">
              {t("location.description")}
            </p>

            <div className="mt-8 flex items-start gap-4">
              <div className="flex h-18 w-18 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-white">
                <MapPin size={35} />
              </div>

              <div>
                <h3 className="font-semibold text-xl">{t("location.addressTitle")}</h3>
                <p className="mt-2 whitespace-pre-line text-lg leading-relaxed text-neutral-600">
                  {t("location.address")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-[#f5f3ee] p-8 text-center">
            <div>
              <MapPin size={32} className="mx-auto text-neutral-400" />
              <p className="mt-4 font-medium">{t("location.mapPlaceholder")}</p>
              <p className="mt-2 text-sm text-neutral-500">
                {t("location.mapDescription")}
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* CONCLUSION */}
      <section className="bg-white px-6 py-20 sm:py-28">
        <ScrollReveal>
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
              
              {t("horaire.seeYouSoon")}
            </p>

            <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
              
              {t("horaire.question")}
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-neutral-600">
              {/* Texte à compléter */}
            </p>

            <a
              href="/contact"
              className="mt-8 inline-flex min-h-14 items-center justify-center gap-3 bg-neutral-950 px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent)]"
            >
              {t("closing.secondaryCta")}
              <ArrowRight size={18} />
            </a>
          </div>
        </ScrollReveal>
      </section>

      {/* MODALE : PLANNING ANNUEL */}
      {showAnnualImage && annualImageAvailable && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/95 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Planning annuel agrandi"
          onClick={() => setShowAnnualImage(false)}
        >
          <button
            type="button"
            aria-label="Fermer l’agrandissement"
            onClick={() => setShowAnnualImage(false)}
            className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-neutral-900 text-white transition-colors hover:bg-white hover:text-neutral-950 sm:right-8 sm:top-8"
          >
            <X size={22} />
          </button>

          <img
            src={annualSchedule.image}
            alt={`Planning annuel de la saison ${annualSchedule.season}`}
            className="max-h-full max-w-full object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </main>
  );
}
