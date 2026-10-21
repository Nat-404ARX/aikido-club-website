import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import ScrollReveal from "../../components/ui/ScrollReveal.tsx";
import { useTranslation } from "react-i18next";

const historySections = [
  {
    year: "1980",
    period: "1980 - 1981",
    key: "origins",
    image: "/assets/images/club/histoire-1980.jpg",
    imageAlt: "",
    theme: "light",
    layout: "image-left",
  },
  {
    year: "1985",
    period: "1985",
    key: "transmission",
    image: "/assets/images/club/histoire-1985.jpg",
    imageAlt: "",
    theme: "dark",
    layout: "image-right",
  },
  {
    year: "2008",
    period: "2008",
    key: "independence",
    image: "/assets/images/club/histoire-2008.jpg",
    imageAlt: "",
    theme: "light",
    layout: "image-left",
  },
  {
    year: "2019",
    period: "2019 - 2022",
    key: "teaching",
    image: "/assets/images/club/histoire-2022.jpg",
    imageAlt: "",
    theme: "dark",
    layout: "image-right",
  },
  {
    year: "2025",
    period: "Depuis septembre 2025",
    key: "new-chapter",
    image: "/assets/images/club/histoire-2025.jpg",
    imageAlt: "",
    theme: "light",
    layout: "image-left",
  },
] as const;

function PhotoPlaceholder({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {

  return (
    <div
      className={`group relative isolate min-h-[280px] overflow-hidden bg-neutral-200 sm:min-h-[380px] lg:min-h-[480px] ${className}`}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />

      <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center gap-4 border border-dashed border-neutral-400/70 p-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-neutral-400/70 text-neutral-500">
          <ArrowUpRight size={24} />
        </span>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
          Photographie à ajouter
        </span>
      </div>

      <div className="pointer-events-none absolute inset-0 border border-black/5" />
    </div>
  );
}

export default function Club() {
  const { t } = useTranslation();
  return (
    <main className="overflow-hidden bg-[#f5f3ee] text-neutral-950">
      {/* INTRODUCTION */}
      <section className="relative px-6 pb-18 pt-18 sm:pb-16 sm:pt-16 lg:pb-20 lg:pt-20">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
              {t("club.club")}
            </p>

            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-8xl">
              {t("club.title")}
              <span className="text-neutral-400">.</span>
              <span className="block min-h-[1.02em]" />
            </h1>

            <div className="mt-2 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <p className="min-h-20 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-md">
                {t("club.intro")}
              </p>

              <a
                href="#histoire"
                className="group inline-flex shrink-0 items-center gap-3 text-sm font-semibold"
              >
                {t("club.ourstory")}
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 transition-all duration-300 group-hover:border-neutral-950 group-hover:bg-neutral-950 group-hover:text-white">
                  <ArrowDown size={18} />
                </span>
              </a>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={120}>
            <div className="mt-14 lg:mt-20">
              <PhotoPlaceholder
                src="/assets/images/club/club-archive-principale.jpg"
                alt=""
                className="aspect-[16/9] min-h-0"
              />
              <div className="mt-3 flex justify-between gap-4 text-xs text-neutral-500">
                <span>{/* Légende de la photo */}</span>
                <span>Dieppe</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* REPÈRES CHRONOLOGIQUES */}
      <section
        id="histoire"
        className="border-y border-neutral-200 bg-white px-6 py-8"
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-4">
          <span className="mr-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            {t("club.chronologie")}
          </span>

          {historySections.map((section) => (
            <a
              key={section.key}
              href={`#${section.key}`}
              className="text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-950"
            >
              {section.year}
            </a>
          ))}
        </div>
      </section>

      {/* SECTIONS HISTORIQUES */}
      {historySections.map((section, index) => {
        const isDark = section.theme === "dark";
        const imageFirst = section.layout === "image-left";

        return (
          <section
            key={section.key}
            id={section.key}
            className={
              isDark
                ? "scroll-mt-20 bg-neutral-950 px-6 py-20 text-white sm:py-28 lg:py-36"
                : "scroll-mt-20 bg-[#f5f3ee] px-6 py-20 text-neutral-950 sm:py-28 lg:py-36"
            }
          >
            <div className="mx-auto max-w-7xl">
              <div
                className={`grid items-center gap-10 lg:grid-cols-12 lg:gap-16 ${imageFirst ? "" : "lg:[&>*:first-child]:order-2"
                  }`}
              >
                {/* VISUEL */}
                <ScrollReveal className="lg:col-span-6">
                  <div className="relative">
                    <PhotoPlaceholder
                      src={section.image}
                      alt={section.imageAlt}
                      className={
                        index % 2 === 0
                          ? "aspect-[4/5] min-h-0"
                          : "aspect-[5/4] min-h-0"
                      }
                    />

                    <span
                      aria-hidden="true"
                      className={`absolute -bottom-8 ${imageFirst ? "-right-2 sm:-right-5" : "-left-2 sm:-left-5"} text-8xl font-semibold leading-none tracking-tighter sm:text-9xl ${isDark ? "text-white/[0.08]" : "text-neutral-950/[0.07]"
                        }`}
                    >
                      {section.year}
                    </span>
                  </div>
                </ScrollReveal>

                {/* CONTENU */}
                <ScrollReveal
                  delay={100}
                  className="lg:col-span-6"
                >
                  <div className="max-w-xl py-3 lg:py-8">
                    <p
                      className={`text-xs font-semibold uppercase tracking-[0.25em] ${isDark ? "text-white/50" : "text-neutral-500"
                        }`}
                    >
                      {section.period}
                    </p>

                    <h2 className="mt-5 min-h-[2.2em] text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                      {/* Titre à compléter */}
                    </h2>

                    <div className="mt-7 h-1 w-12 bg-[var(--color-accent)]" />

                    <div
                      className={`mt-8 min-h-40 space-y-5 text-base leading-relaxed sm:text-lg ${isDark ? "text-neutral-300" : "text-neutral-600"
                        }`}
                    >
                      {/* Texte historique à compléter */}
                      <p />
                      <p />
                    </div>

                    <div
                      className={`mt-10 flex items-center gap-4 border-t pt-5 ${isDark ? "border-white/15" : "border-neutral-300"
                        }`}
                    >
                      <span
                        className={`text-xs font-semibold uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-neutral-400"
                          }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span
                        className={`h-px flex-1 ${isDark ? "bg-white/15" : "bg-neutral-300"
                          }`}
                      />
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </section>
        );
      })}

      {/* CONCLUSION */}
      <section className="bg-white px-6 py-24 sm:py-32 lg:py-36">
        <ScrollReveal>
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
              {t("hero.eyebrow")}
            </p>

            <h2 className="mx-auto mt-6 min-h-[2.2em] max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {/* Titre de conclusion à compléter */}
            </h2>

            <div className="mx-auto mt-8 h-1 w-12 bg-[var(--color-accent)]" />

            <p className="mx-auto mt-6 min-h-12 max-w-xl text-neutral-600 sm:text-lg">
              {/* Texte de conclusion à compléter */}
            </p>

            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                to="/cours"
                className="group inline-flex min-h-14 items-center justify-center gap-3 bg-neutral-950 px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent)]"
              >
                {t("teachers.cta")}
                <ArrowUpRight
                  size={18}
                  className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/contact"
                className="inline-flex min-h-14 items-center justify-center gap-3 border border-neutral-300 px-7 py-4 text-sm font-semibold transition-colors hover:border-neutral-950"
              >
                {t("closing.secondaryCta")}
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </main>
  );
}
