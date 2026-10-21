import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowDown, ArrowUpRight, Clock } from "lucide-react";
import ScrollReveal from "../../components/ui/ScrollReveal.tsx";
type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
type Slot = { day: DayKey; time: string | null };
type Course = { id: string; kanji: string; slots: Slot[] };

const courses: Course[] = [
  { id: "all", kanji: "皆", slots: [{ day: "tue", time: null }, { day: "thu", time: null }] },
  { id: "teen", kanji: "若", slots: [{ day: "wed", time: null }] },
  { id: "weapons", kanji: "剣", slots: [{ day: "fri", time: null }] },
  { id: "taiso", kanji: "体", slots: [{ day: "mon", time: "17h30 - 18h30" }] },
  { id: "advanced", kanji: "段", slots: [{ day: "thu", time: null }] },
  { id: "themed", kanji: "題", slots: [{ day: "sat", time: null }] },
];

const courseIds = courses.map((c) => c.id);


function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [ids]);
  return active;
}


function Enso() {
  return (
    <div aria-hidden className="relative mx-auto aspect-square w-full max-w-[26rem]">
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-[24deg]">
        <path pathLength={1} className="enso-draw" d="M100 14 A86 86 0 1 1 52 28" fill="none" stroke="var(--color-accent)" strokeWidth="9" strokeLinecap="round" />
        <path pathLength={1} className="enso-draw enso-draw-thin" d="M100 20 A80 80 0 1 1 56 33" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" opacity=".45" />
      </svg>
      <span className="kanji-float absolute inset-0 flex items-center justify-center text-[7.5rem] font-semibold leading-none text-[var(--color-primary)] sm:text-[9rem]">
        道
      </span>
    </div>
  );
}

function Photo({ alt, kanji }: { alt: string; kanji: string }) {
  return (
    <figure className="photo-frame group relative">
      {/* <img src="/images/cours/xxx.jpg" alt={alt} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /> */}
      <div role="img" aria-label={alt} className="photo-placeholder relative flex aspect-[4/5] items-end overflow-hidden rounded-[2rem] border border-[var(--color-border)] p-6">
        <p className="relative z-10 max-w-[18rem] text-xs leading-relaxed text-[var(--color-text-muted)]">{alt}</p>
      </div>
      <span aria-hidden className="absolute -bottom-5 -right-3 flex h-16 w-16 rotate-6 items-center justify-center rounded-lg bg-[var(--color-accent)] text-3xl font-semibold text-white shadow-lg shadow-[var(--color-accent)]/25 transition-transform duration-500 group-hover:rotate-0 sm:-right-5 sm:h-20 sm:w-20 sm:text-4xl">
        {kanji}
      </span>
    </figure>
  );
}

export default function Cours() {
  const { t } = useTranslation();
  const active = useActiveSection(courseIds);

  return (
    <main className="bg-[var(--color-background)] text-[var(--color-text)]">
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden px-6 pb-12 pt-12 sm:pb-16 lg:pt-16">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <ScrollReveal>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">{t("cours.about")}</p>

              <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                {t("cours.titleA")}
                <br />
                <span className="text-neutral-400">{t("cours.titleB")}</span>
              </h1>

              <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <p className="max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg">{t("cours.intro")}</p>
                <a href="#all" className="group inline-flex shrink-0 items-center gap-3 text-sm font-semibold">
                  {t("cours.explore")}
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 transition-all duration-300 group-hover:border-neutral-950 group-hover:bg-neutral-950 group-hover:text-white">
                    <ArrowDown size={18} />
                  </span>
                </a>
              </div>
            </ScrollReveal>
          </div>

          <div className="lg:col-span-4">
            <Enso />
          </div>
        </div>
      </section>

      {/* ============ NAV COLLANTE ============ */}
      <nav aria-label={t("cours.nav")} className="sticky top-[var(--header-h,4.5rem)] z-30 border-y border-[var(--color-border)] bg-white/80 backdrop-blur-md">
        <ul className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-6 py-3 [scrollbar-width:none]">
          {courses.map((c) => {
            const isActive = active === c.id;
            return (
              <li key={c.id} className="shrink-0">
                <a
                  href={`#${c.id}`}
                  aria-current={isActive ? "true" : undefined}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] ${isActive
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                    : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-text)] hover:text-[var(--color-text)]"
                    }`}
                >
                  <span aria-hidden className="text-base leading-none">{c.kanji}</span>
                  {t(`cours.items.${c.id}.name`)}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {courses.map((c, i) => {
        const flip = i % 2 === 1;
        return (
          <section
            key={c.id}
            id={c.id}
            className={`relative scroll-mt-32 overflow-hidden px-6 py-20 sm:py-28 ${i % 2 === 0 ? "" : "bg-[var(--color-surface)]"}`}
          >
            <span aria-hidden className={`kanji-ghost pointer-events-none absolute top-6 select-none text-[22rem] font-semibold leading-none ${flip ? "left-[-3rem]" : "right-[-3rem]"}`}>
              {c.kanji}
            </span>

            <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-12 lg:gap-20">
              <div className={`lg:col-span-5 ${flip ? "lg:order-2" : ""}`}>
                <ScrollReveal>
                  <Photo alt={t(`cours.items.${c.id}.alt`)} kanji={c.kanji} />
                </ScrollReveal>
              </div>

              <div className={`lg:col-span-7 ${flip ? "lg:order-1" : ""}`}>
                <ScrollReveal>
                  <div className="flex flex-wrap gap-2">
                    {(["audience", "tag"] as const).map((k) => (
                      <span key={k} className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-xs font-medium text-[var(--color-text-muted)]">
                        {t(`cours.items.${c.id}.${k}`)}
                      </span>
                    ))}
                  </div>

                  <h2 className="title-underline mt-6 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                    {t(`cours.items.${c.id}.name`)}
                  </h2>

                  <p className="mt-8 max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg">
                    {t(`cours.items.${c.id}.description`)}
                  </p>

                  {/* Horaires */}
                  <div className="mt-10 max-w-xl">
                    <h3 className="flex items-center gap-2 text-sm font-semibold">
                      <Clock size={16} className="text-[var(--color-accent)]" />
                      {t("cours.schedule")}
                    </h3>
                    <ul className="mt-4 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
                      {c.slots.map((s) => (
                        <li key={s.day} className="slot-row flex items-center justify-between gap-4 py-4">
                          <span className="text-lg font-medium">{t(`cours.days.${s.day}`)}</span>
                          <span className={`rounded-full px-4 py-1.5 text-sm font-semibold tabular-nums transition-colors duration-300 ${s.time ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]" : "bg-[var(--color-surface)] text-[var(--color-text-muted)]"}`}>
                            {s.time ?? t("cours.tba")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a href="/contact" className="group mt-10 inline-flex items-center gap-3 text-sm font-semibold">
                    {t("cours.trial")}
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 transition-all duration-300 group-hover:border-[var(--color-accent)] group-hover:bg-[var(--color-accent)] group-hover:text-white">
                      <ArrowUpRight size={18} className="transition-transform duration-300 group-hover:rotate-45" />
                    </span>
                  </a>
                </ScrollReveal>
              </div>
            </div>
          </section>
        );
      })}
      <section className="relative overflow-hidden bg-[var(--color-primary)] px-6 pb-36 pt-24 text-white sm:pb-44 sm:pt-32">
        <div className="relative mx-auto max-w-4xl text-center">
          <ScrollReveal>
            <h2 className="text-4xl font-semibold tracking-tight sm:text-6xl">{t("cours.ctaTitle")}</h2>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">{t("cours.ctaText")}</p>
            <a href="/contact" className="mt-10 inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-semibold text-[var(--color-primary)] transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--color-accent)] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              {t("cours.ctaButton")}
              <ArrowUpRight size={18} />
            </a>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
