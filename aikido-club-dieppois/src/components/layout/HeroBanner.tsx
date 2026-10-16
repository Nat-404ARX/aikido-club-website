import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";

type FeaturedEvent = {
  title: string;
  description: string;
  image: string;
  href: string;
};

type HeroBannerProps = {
  featuredEvent?: FeaturedEvent | null;
};

export default function HeroBanner({
  featuredEvent,
}: HeroBannerProps) {
  const { t } = useTranslation();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slideCount = featuredEvent ? 2 : 1;

  useEffect(() => {
    setActiveSlide(0);
  }, [featuredEvent?.title, featuredEvent?.image]);

  useEffect(() => {
    if (isPaused || slideCount < 2) return;

    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slideCount);
    }, 7000);

    return () => window.clearInterval(interval);
  }, [isPaused, slideCount]);

  const goToSlide = (index: number) => {
    setActiveSlide((index + slideCount) % slideCount);
  };

  return (
    <section
      aria-label={t("hero.label")}
      aria-roledescription="carousel"
      className="relative overflow-hidden bg-neutral-950 text-white"
    >
      <div className="relative">
        {/* Bannière classique */}
        <div
          className={
            activeSlide === 0
              ? "block"
              : "hidden"
          }
          aria-hidden={activeSlide !== 0}
        >
          <div className="mx-auto grid min-h-[560px] max-w-7xl items-center gap-10 px-5 py-6 md:grid-cols-2 md:px-10">
            <div className="relative z-10">
              <p className="mb-5 text-sm uppercase tracking-[0.25em] text-neutral-400">
                {t("hero.eyebrow")}
              </p>

              <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                {t("hero.title")}
                <span className="mt-2 block text-neutral-400">
                  {t("hero.subtitle")}
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-300">
                {t("hero.description")}
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  to="/horaires"
                  className="rounded-md bg-[var(--color-accent)] px-6 py-3 font-medium text-white transition-transform duration-200 hover:-translate-y-1"
                >
                  {t("hero.scheduleCta")}
                </Link>

                <Link
                  to="/aikido"
                  className="rounded-md border border-white/30 px-6 py-3 font-medium transition-colors duration-200 hover:bg-white/10"
                >
                  {t("hero.aikidoCta")}
                </Link>
              </div>

              <blockquote className="mt-8 max-w-xl border-l-2 border-[var(--color-accent)] pl-4 text-sm leading-relaxed text-neutral-300 sm:text-base">
                <p>{t("hero.quote")}</p>
                <footer className="mt-3 text-xs font-medium uppercase tracking-wider text-neutral-400">
                  - {t("hero.quoteAuthor")}
                </footer>
              </blockquote>
            </div>

            <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-950 md:min-h-[420px]">
              <div
                className="absolute inset-0 opacity-30"
                aria-hidden="true"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(135deg, transparent, transparent 39px, #ffffff 40px, transparent 41px)",
                }}
              />

              <div className="relative h-full w-full">
                <img
                  src="/assets/images/header.avif"
                  alt={t("hero.imageAlt")}
                  className="h-full w-full object-cover"
                  fetchPriority="high"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bannière événementielle : affichée uniquement si un événement existe */}
        {featuredEvent && (
          <div
            className={activeSlide === 1 ? "block" : "hidden"}
            aria-hidden={activeSlide !== 1}
          >
            <div className="mx-auto grid min-h-[560px] max-w-7xl items-center gap-10 px-5 py-6 md:grid-cols-2 md:px-10">
              <div className="relative z-10">
                <p className="mb-5 text-sm uppercase tracking-[0.25em] text-neutral-400">
                  {t("hero.eventEyebrow")}
                </p>

                <h2 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                  {featuredEvent.title}
                </h2>

                <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-300">
                  {featuredEvent.description}
                </p>

                <div className="mt-9">
                  <Link
                    to={featuredEvent.href}
                    tabIndex={activeSlide === 1 ? 0 : -1}
                    className="inline-flex rounded-md bg-[var(--color-accent)] px-6 py-3 font-medium text-white transition-transform duration-200 hover:-translate-y-1"
                  >
                    {t("hero.eventCta")}
                  </Link>
                </div>
              </div>

              <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 md:min-h-[420px]">
                <img
                  src={featuredEvent.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-neutral-950/10 to-transparent" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Commandes du diaporama */}
      {slideCount > 1 && (
        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/15 bg-neutral-950/70 px-3 py-2 backdrop-blur-md">
          <button
            type="button"
            onClick={() => goToSlide(activeSlide - 1)}
            aria-label={t("hero.previous")}
            className="rounded-full p-2 transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: slideCount }, (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToSlide(index)}
                aria-label={t("hero.goToSlide", { number: index + 1 })}
                aria-current={activeSlide === index ? "true" : undefined}
                className={`h-2.5 rounded-full transition-all ${
                  activeSlide === index
                    ? "w-7 bg-white"
                    : "w-2.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => goToSlide(activeSlide + 1)}
            aria-label={t("hero.next")}
            className="rounded-full p-2 transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>

          <button
            type="button"
            onClick={() => setIsPaused((paused) => !paused)}
            aria-label={
              isPaused ? t("hero.resume") : t("hero.pause")
            }
            className="rounded-full p-2 transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            {isPaused ? (
              <Play aria-hidden="true" className="size-4" />
            ) : (
              <Pause aria-hidden="true" className="size-4" />
            )}
          </button>
        </div>
      )}

      <div className="h-1 w-full bg-[var(--color-accent)]" />
    </section>
  );
}
