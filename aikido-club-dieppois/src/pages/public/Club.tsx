import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowDown, ArrowUpRight, RefreshCw } from "lucide-react";
import ScrollReveal from "../../components/ui/ScrollReveal.tsx";
import Lightbox from "../../components/ui/Lightbox.tsx";
import { BlockView } from "../../components/ui/ClubBlocks.tsx";
import { useActiveSection, useInView, vi } from "../../components/ui/Motion.tsx";
import { useClubPage } from "../../hooks/useClubPage.tsx";
import type { ClubImage, ClubSection } from "../../lib/club.ts";

const heroChars = ["道", "場"]; 
function SectionView({ section, index, onOpen }: { section: ClubSection; index: number; onOpen: (p: ClubImage[], i: number) => void }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.4);
  return (
    <section id={section.slug} className={`scroll-mt-32 px-6 py-20 sm:py-28 ${index % 2 === 1 ? "bg-[var(--color-surface)]" : ""}`}>
      <div className="mx-auto max-w-7xl">
        <div className="grid items-start gap-6 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-9">
            {section.kanji && (
              <span aria-hidden className="inline-flex h-12 min-w-12 items-center justify-center rounded-lg bg-[var(--color-accent)] px-2 text-2xl font-semibold text-white">
                {section.kanji}
              </span>
            )}
            <div ref={ref} data-in={inView} className="ink-wipe mt-5">
              <h2 className="title-underline break-words text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">{section.title}</h2>
            </div>
            {section.subtitle && (
              <ScrollReveal>
                <p className="mt-6 max-w-2xl break-words text-base leading-relaxed text-neutral-600 sm:text-lg">{section.subtitle}</p>
              </ScrollReveal>
            )}
          </div>
          {/* grand kanji décoratif : en flux normal, masqué sur mobile */}
          {section.kanji && (
            <span aria-hidden className="hidden select-none text-right text-[9rem] font-semibold leading-none text-[var(--color-primary)] opacity-[0.05] lg:col-span-3 lg:block">
              {section.kanji.slice(0, 2)}
            </span>
          )}
        </div>

        <div className="mt-14 space-y-16 sm:space-y-20">
          {section.blocks.map((b) => <BlockView key={b.id} block={b} onOpen={onOpen} />)}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
export default function Club() {
  const { t } = useTranslation();
  const { page, state, reload } = useClubPage();
  const [lightbox, setLightbox] = useState<{ photos: ClubImage[]; index: number } | null>(null);
  const [heroRef, heroIn] = useInView<HTMLDivElement>(0.1);

  const sections = page?.sections ?? [];
  const ids = useMemo(() => sections.map((s) => s.slug), [sections]);
  const active = useActiveSection(ids);

  return (
    <main className="bg-[var(--color-background)] text-[var(--color-text)]">
      {/* ============ HERO ============ */}
      <section className="overflow-hidden px-6 pb-12 pt-16 sm:pb-16 lg:pt-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="min-w-0 lg:col-span-8">
            <ScrollReveal>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">{t("club.about")}</p>
              <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                {t("club.titleA")}
                <br />
                <span className="text-neutral-400">{t("club.titleB")}</span>
              </h1>
              <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <p className="max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg">{t("club.intro")}</p>
                <a href={sections[0] ? `#${sections[0].slug}` : "#"} className="group inline-flex shrink-0 items-center gap-3 text-sm font-semibold">
                  {t("club.explore")}
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 transition-all duration-300 group-hover:border-neutral-950 group-hover:bg-neutral-950 group-hover:text-white">
                    <ArrowDown size={18} />
                  </span>
                </a>
              </div>
            </ScrollReveal>
          </div>

          <div aria-hidden className="relative mx-auto flex w-fit items-start justify-center overflow-hidden px-8 py-4 lg:col-span-4">
            <p className="flex flex-col text-[4rem] font-semibold leading-[1.05] text-[var(--color-primary)] sm:text-[6rem] lg:text-[7.5rem]">
              {heroChars.map((c, i) => <span key={c} className="ink" style={vi(i)}>{c}</span>)}
            </p>
            <span className="slash" />
          </div>
        </div>
      </section>

      {/* Image d'en-tête (optionnelle, éditable) */}
      {page?.hero_image_url && (
        <div className="px-6 pb-8">
          <div ref={heroRef} data-in={heroIn} className="cut-reveal cover-zoom mx-auto aspect-[4/3] max-w-7xl overflow-hidden rounded-[2rem] sm:aspect-[16/8]">
            <img src={page.hero_image_url} alt={page.hero_image_alt} decoding="async" className="h-full w-full object-cover" />
          </div>
        </div>
      )}

      {/* ============ NAVIGATION SECONDAIRE (collante) ============ */}
      {state === "ready" && sections.length > 0 && (
        <nav aria-label={t("club.nav")} className="sticky top-[var(--header-h,4.5rem)] z-30 mt-8 border-y border-[var(--color-border)] bg-white/80 backdrop-blur-md">
          <ul className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-6 py-3 [scrollbar-width:none]">
            {sections.map((s) => {
              const isActive = active === s.slug;
              return (
                <li key={s.id} className="shrink-0">
                  <a
                    href={`#${s.slug}`}
                    aria-current={isActive ? "true" : undefined}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] ${isActive
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                        : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-text)] hover:text-[var(--color-text)]"
                      }`}
                  >
                    {s.kanji && <span aria-hidden className="text-base leading-none">{s.kanji.slice(0, 2)}</span>}
                    {s.navLabel || s.title}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {/* ============ ÉTATS : chargement / erreur / vide ============ */}
      {state === "loading" && (
        <div aria-busy="true" className="mx-auto max-w-7xl space-y-6 px-6 py-20">
          <div className="h-10 w-2/3 animate-pulse rounded-xl bg-[var(--color-surface)]" />
          <div className="h-40 animate-pulse rounded-3xl bg-[var(--color-surface)]" />
          <div className="h-40 animate-pulse rounded-3xl bg-[var(--color-surface)]" />
        </div>
      )}

      {state === "error" && (
        <div className="mx-auto max-w-2xl px-6 py-20 text-center">
          <p className="text-lg font-medium">{t("club.error")}</p>
          <button type="button" onClick={reload} className="mt-6 inline-flex items-center gap-2 rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold transition-colors hover:border-neutral-950 hover:bg-neutral-950 hover:text-white">
            <RefreshCw size={16} aria-hidden />{t("club.retry")}
          </button>
        </div>
      )}

      {state === "ready" && sections.length === 0 && (
        <div className="mx-auto max-w-2xl px-6 py-20 text-center">
          <span aria-hidden className="text-7xl font-semibold text-neutral-200">準</span>
          <p className="mt-4 text-xl font-semibold">{t("club.emptyTitle")}</p>
          <p className="mt-2 text-[var(--color-text-muted)]">{t("club.emptyText")}</p>
        </div>
      )}

      {/* ============ SECTIONS ============ */}
      {state === "ready" && sections.map((s, i) => (
        <SectionView key={s.id} section={s} index={i} onOpen={(photos, index) => setLightbox({ photos, index })} />
      ))}

      {/* ============ CTA FINAL (marge basse = place pour les vagues) ============ */}
      <section className="bg-[var(--color-primary)] px-6 pb-36 pt-24 text-white sm:pb-44 sm:pt-32">
        <div className="mx-auto max-w-4xl text-center">
          <ScrollReveal>
            <h2 className="text-4xl font-semibold tracking-tight sm:text-6xl">{t("club.ctaTitle")}</h2>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">{t("club.ctaText")}</p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/cours" className="inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-semibold text-[var(--color-primary)] transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--color-accent)] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                {t("club.ctaButton")}<ArrowUpRight size={18} />
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-3 rounded-full border border-white/40 px-8 py-4 text-sm font-semibold transition-all duration-300 hover:border-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                {t("club.ctaContact")}
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {lightbox && <Lightbox photos={lightbox.photos} index={lightbox.index} onIndex={(i) => setLightbox({ ...lightbox, index: i })} onClose={() => setLightbox(null)} />}
    </main>
  );
}