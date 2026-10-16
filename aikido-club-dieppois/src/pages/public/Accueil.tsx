import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import HeroBanner from "../../components/layout/HeroBanner.tsx"
import { useTranslation } from "react-i18next";
import { ArrowUpRight, ArrowRight, ArrowLeft } from "lucide-react";
import ScrollReveal from "../../components/ui/ScrollReveal.tsx";

export default function Accueil() {

  const featuredEvent = null;
  const { t } = useTranslation();

  const historyMilestones = [
    { year: "1981", key: "foundation" },
    { year: "2025", key: "newChapter" },
  ] as const;

  const teachers = [
    {
      key: "gilles",
      number: "01",
      image: "/assets/images/prof/gilles.png",
    },
    {
      key: "florent",
      number: "02",
      image: "/assets/images/prof/florent.png",
    },
    {
      key: "patrick",
      number: "03",
      image: "/assets/images/prof/patrick.png",
    },
    {
      key: "jose",
      number: "04",
      image: "/assets/images/prof/jose.png",
    },
  ] as const;

  const teachersTrackRef = useRef<HTMLDivElement>(null);
  const [activeTeacher, setActiveTeacher] = useState(0);

  const moveTeacher = (direction: -1 | 1) => {
    const track = teachersTrackRef.current;
    if (!track) return;

    const nextIndex = Math.max(
      0,
      Math.min(teachers.length - 1, activeTeacher + direction)
    );

    if (nextIndex === activeTeacher) return;

    const card = track.children[nextIndex] as HTMLElement | undefined;
    if (!card) return;

    setActiveTeacher(nextIndex);

    track.scrollTo({
      left: card.offsetLeft - track.offsetLeft,
      behavior: "smooth",
    });
  };

  return (
    <>
      <HeroBanner featuredEvent={featuredEvent} />

      <section className="relative overflow-hidden bg-[#f4f1e9] text-neutral-950">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:grid-cols-12 md:items-center md:gap-10 md:px-10 md:py-32">
          <div className="relative md:col-span-6">
            <ScrollReveal>
              <div className="relative">
                <div className="absolute -left-3 -top-5 z-10 flex size-20 items-center justify-center rounded-full border border-neutral-950/20 bg-[#f4f1e9] text-center text-xs font-semibold uppercase tracking-widest sm:-left-5 sm:-top-6">
                  {t("about.since")}
                  <br />
                  1981
                </div>

                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-neutral-200">
                  <img
                    src="/assets/images/quisommenous.png"
                    alt={t("about.imageAlt")}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03] motion-reduce:transform-none"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950/35 via-transparent to-transparent" />
                </div>

                <span
                  aria-hidden="true"
                  className="absolute -bottom-4 -right-3 -z-0 h-24 w-24 border-b border-r border-[var(--color-accent)] sm:-bottom-6 sm:-right-5"
                />
              </div>
            </ScrollReveal>
          </div>

          <div className="relative md:col-span-6 md:pl-8 lg:pl-14">
            <ScrollReveal delay={120}>
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-accent)] sm:text-sm">
                <span className="h-px w-8 bg-[var(--color-accent)]" />
                {t("about.eyebrow")}
              </p>

              <h2 className="mt-6 max-w-xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                {t("about.title")}
              </h2>

              <p className="mt-7 max-w-xl text-lg leading-relaxed text-neutral-600">
                {t("about.description")}
              </p>

              <Link
                to="/contact"
                className="group mt-8 inline-flex items-center gap-3 border-b border-neutral-300 pb-3 text-sm font-semibold transition-colors hover:border-[var(--color-accent)]"
              >
                {t("about.cta")}
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                />
              </Link>
            </ScrollReveal>

            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-4 top-0 hidden select-none text-[10rem] font-semibold leading-none text-neutral-950/[0.035] lg:block"
            >
              {"\u262F"}
            </span>
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-neutral-950 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_80%_40%,rgba(255,255,255,0.08),transparent_55%)]"
        />

        <div className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-32">
          <div className="grid gap-12 md:grid-cols-12 md:items-center md:gap-10">
            <div className="md:col-span-7">
              <ScrollReveal>
                <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-accent)] sm:text-sm">
                  <span className="h-px w-8 bg-[var(--color-accent)]" />
                  {t("objective.eyebrow")}
                </p>

                <h2 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-7xl">
                  {t("objective.title")}
                </h2>

                <p className="mt-7 max-w-2xl text-lg leading-relaxed text-neutral-300">
                  {t("objective.description")}
                </p>
              </ScrollReveal>

              <div className="mt-12 grid gap-6 border-t border-white/15 pt-7 sm:grid-cols-3">
                {(["progression", "sharing", "respect"] as const).map(
                  (value, index) => (
                    <ScrollReveal key={value} delay={index * 100}>
                      <div className="group">
                        <p className="text-xs tracking-widest text-neutral-500">
                          0{index + 1}
                        </p>
                        <h3 className="mt-3 text-xl font-medium transition-colors group-hover:text-[var(--color-accent)]">
                          {t(`objective.values.${value}`)}
                        </h3>
                        <div className="mt-4 h-px w-8 bg-[var(--color-accent)] transition-all duration-300 group-hover:w-16" />
                      </div>
                    </ScrollReveal>
                  ),
                )}
              </div>

              <ScrollReveal delay={200}>
                <Link
                  to="/aikido"
                  className="group mt-10 inline-flex items-center gap-3 text-sm font-semibold text-white"
                >
                  {t("objective.cta")}
                  <ArrowRight
                    aria-hidden="true"
                    className="size-5 transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </ScrollReveal>
            </div>

            <div className="md:col-span-5">
              <ScrollReveal delay={150}>
                <div className="relative aspect-[1/2] max-h-200 overflow-hidden rounded-xl bg-neutral-800">
                  <img
                    src="/assets/images/pratique-aikido.png"
                    alt={t("objective.imageAlt")}
                    loading="lazy"
                    className="h-full w-full object-cover opacity-85 transition-transform duration-700 hover:scale-[1.03] motion-reduce:transform-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-neutral-950/10 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/30 to-transparent" />

                  <p className="absolute bottom-6 left-6 max-w-xs text-sm leading-relaxed text-white/85">
                    {t("objective.imageCaption")}
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
      <section className="relative overflow-hidden bg-[#f4f1e9] text-neutral-950">
        <div className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-32">
          <ScrollReveal>
            <div className="grid gap-8 md:grid-cols-12 md:items-end">
              <div className="md:col-span-8">
                <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-accent)] sm:text-sm">
                  <span className="h-px w-8 bg-[var(--color-accent)]" />
                  {t("history.eyebrow")}
                </p>

                <h2 className="mt-6 max-w-3xl text-2xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-5xl">
                  {t("history.title")}
                </h2>
              </div>

              <p className="max-w-md text-base leading-relaxed text-neutral-600 md:col-span-4 md:justify-self-end">
                {t("history.intro")}
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Image d'archive */}
            <div className="lg:col-span-5">
              <ScrollReveal>
                <div className="group relative lg:sticky lg:top-24">
                  <div className="relative aspect-[4/5] overflow-hidden bg-neutral-200 rounded-xl">
                    <img
                      src="/assets/images/accueil/histoire-club.jpg"
                      alt={t("history.imageAlt")}
                      loading="lazy"
                      className="h-full w-full object-cover grayscale transition duration-700 group-hover:scale-[1.03] group-hover:grayscale-0 motion-reduce:transform-none"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />

                    <div className="absolute bottom-0 left-0 p-6 text-white sm:p-8">
                      <p className="text-xs font-medium uppercase tracking-[0.25em] text-white/70">
                        {t("history.imageEyebrow")}
                      </p>
                      <p className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                        1981  {t("history.imageCaption")}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-neutral-500">
                    {t("history.imageNote")}
                  </p>
                </div>
              </ScrollReveal>
            </div>

            {/* Frise chronologique */}
            <div className="relative lg:col-span-7">
              <div
                aria-hidden="true"
                className="absolute bottom-4 left-[19px] top-4 w-px bg-neutral-300 sm:left-[27px]"
              />

              <div className="space-y-10 sm:space-y-14">
                {historyMilestones.map((milestone, index) => (
                  <ScrollReveal key={milestone.year} delay={index * 60}>
                    <article className="relative grid grid-cols-[40px_1fr] gap-4 sm:grid-cols-[56px_1fr] sm:gap-6">
                      <div className="relative z-10 flex size-10 items-center justify-center rounded-full border border-neutral-300 bg-[#f4f1e9] sm:size-14">
                        <span className="size-2 rounded-full bg-[var(--color-accent)]" />
                      </div>

                      <div className="border-b border-neutral-300 pb-8 sm:pb-10">
                        <p className="text-4xl font-semibold tracking-tighter text-[var(--color-accent)] sm:text-5xl">
                          {milestone.year}
                        </p>

                        <h3 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">
                          {t(`history.milestones.${milestone.key}.title`)}
                        </h3>

                        <p className="mt-3 max-w-xl text-base leading-relaxed text-neutral-600">
                          {t(`history.milestones.${milestone.key}.description`)}
                        </p>
                      </div>
                    </article>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>

          <ScrollReveal>
            <div className="mt-16 flex flex-col gap-5 border-t border-neutral-300 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xl text-sm leading-relaxed text-neutral-600">
                {t("history.footer")}
              </p>

              <Link
                to="/club"
                className="group inline-flex shrink-0 items-center gap-3 text-sm font-semibold"
              >
                {t("history.cta")}
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
      <section className="relative overflow-hidden bg-neutral-950 text-white">
        <div className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-32">
          <ScrollReveal>
            <div className="grid gap-8 md:grid-cols-12 md:items-end">
              <div className="md:col-span-8">
                <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-accent)] sm:text-sm">
                  <span className="h-px w-8 bg-[var(--color-accent)]" />
                  {t("teachers.eyebrow")}
                </p>

                <h2 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-7xl">
                  {t("teachers.title")}
                </h2>
              </div>

              <p className="max-w-md text-base leading-relaxed text-neutral-400 md:col-span-4 md:justify-self-end">
                {t("teachers.intro")}
              </p>
            </div>
          </ScrollReveal>

          
          <div className="relative mt-14 lg:mt-20">
            {/* Carrousel */}
            <div
              ref={teachersTrackRef}
              className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-1 pb-8 sm:gap-7 lg:gap-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {teachers.map((teacher, index) => (
                <ScrollReveal key={teacher.key} delay={0}>
                  <article
                    className="group relative w-[78vw] max-w-[340px] shrink-0 snap-start sm:w-[42vw] lg:w-[29vw] lg:max-w-[390px]"
                  >
                    {/* Portrait découpé en arche */}
                    <div className="relative isolate aspect-[4/5] overflow-hidden rounded-t-[48%] rounded-b-2xl bg-neutral-900">
                      <img
                        src={teacher.image}
                        alt={t(`teachers.people.${teacher.key}.imageAlt`)}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-1000 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-110 group-hover:rotate-1 motion-reduce:transform-none"
                      />

                      {/* Voile sombre qui s'intensifie au survol */}
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/25 to-neutral-950/5 transition-opacity duration-700 group-hover:opacity-90" />

                      {/* Halo coloré en bas */}
                      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[var(--color-accent)]/35 to-transparent opacity-0 transition-all duration-700 group-hover:opacity-100" />

                      {/* Contour animé */}
                      <div className="pointer-events-none absolute inset-3 rounded-t-[48%] rounded-b-xl border border-white/0 transition-all duration-700 group-hover:inset-5 group-hover:border-white/55" />

                      {/* Numéro décoratif
                      <span
                        aria-hidden="true"
                        className="absolute right-9 top-12 text-7xl font-semibold leading-none tracking-tighter text-white/25 transition-all duration-700 group-hover:translate-y-2 group-hover:text-white/50 sm:text-8xl"
                      >
                        {teacher.number}
                      </span>
                      */}

                      {/* Informations */}
                      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                        <p className="translate-y-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/65 opacity-80 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                          {t(`teachers.people.${teacher.key}.role`)}
                        </p>

                        <h3 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-white transition-transform duration-500 group-hover:-translate-y-1 sm:text-3xl">
                          {t(`teachers.people.${teacher.key}.name`)}
                        </h3>

                        <div className="mt-4 h-px w-10 origin-left bg-[var(--color-accent)] transition-all duration-700 group-hover:w-20" />

                        <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-neutral-200 transition-colors duration-500 group-hover:text-white sm:text-base">
                          {t(`teachers.people.${teacher.key}.description`)}
                        </p>
                      </div>
                    </div>

                    {/* Repère discret sous la carte */}
                    <div className="mt-4 flex items-center justify-between px-1">
                      <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                        {String(index + 1).padStart(2, "0")} /{" "}
                        {String(teachers.length).padStart(2, "0")}
                      </span>
                      <span className="h-px w-12 bg-neutral-700 transition-all duration-500 group-hover:w-20 group-hover:bg-[var(--color-accent)]" />
                    </div>
                  </article>
                </ScrollReveal>
              ))}
            </div>

            {/* Commandes flottantes */}
            <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between">
              <button
                type="button"
                aria-label="Professeur précédent"
                onClick={() => moveTeacher(-1)}
                disabled={activeTeacher === 0}
                className="pointer-events-auto -ml-2 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-neutral-950/90 text-white shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)] disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-30 sm:-ml-5 sm:h-14 sm:w-14"
              >
                <ArrowLeft size={22} />
              </button>

              <button
                type="button"
                aria-label="Professeur suivant"
                onClick={() => moveTeacher(1)}
                disabled={activeTeacher === teachers.length - 1}
                className="pointer-events-auto -mr-2 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-neutral-950/90 text-white shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)] disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-30 sm:-mr-5 sm:h-14 sm:w-14"
              >
                <ArrowRight size={22} />
              </button>
            </div>
          </div>


          <ScrollReveal delay={150}>
            <div className="mt-12 flex flex-col gap-5 border-t border-white/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xl text-sm leading-relaxed text-neutral-400">
                {t("teachers.footer")}
              </p>

              <Link
                to="/cours"
                className="group inline-flex shrink-0 items-center gap-3 text-sm font-semibold text-white"
              >
                {t("teachers.cta")}
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
      
      <section className="relative overflow-hidden bg-[#f5f3ee] px-6 py-24 text-neutral-950 sm:py-32 lg:py-36">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-neutral-900/[0.06] sm:h-96 sm:w-96" />
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border border-neutral-900/[0.06] sm:h-72 sm:w-72" />

        <ScrollReveal>
          <div className="relative mx-auto max-w-4xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
              {t("closing.eyebrow")}
            </p>

            <h2 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-7xl">
              {t("closing.title")}
            </h2>

            <div className="mx-auto mt-8 h-1 w-14 bg-[var(--color-accent)]" />

            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg">
              {t("closing.description")}
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/club"
                className="group inline-flex min-h-14 items-center justify-center gap-3 bg-neutral-950 px-7 py-4 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[var(--color-accent)]"
              >
                {t("closing.primaryCta")}
                <ArrowUpRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </Link>

              <Link
                to="/contact"
                className="group inline-flex min-h-14 items-center justify-center gap-3 border border-neutral-300 px-7 py-4 text-sm font-semibold text-neutral-900 transition-colors duration-300 hover:border-neutral-950"
              >
                {t("closing.secondaryCta")}
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

    </>
  );
}
