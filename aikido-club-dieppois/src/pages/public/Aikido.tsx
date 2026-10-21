import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowDown, ArrowUpRight, ChevronDown } from "lucide-react";
import ScrollReveal from "../../components/ui/ScrollReveal";

type TLEvent = { id: string; kanji: string; year?: string; photo?: boolean };

const sections = [
  { id: "essence", kanji: "心" },
  { id: "histoire", kanji: "史" },
  { id: "ueshiba", kanji: "翁" },
  { id: "aujourdhui", kanji: "今" },
];
const sectionIds = sections.map((s) => s.id);

const nameChars = [
  { id: "ai", char: "合", reading: "ai" },
  { id: "ki", char: "気", reading: "ki" },
  { id: "do", char: "道", reading: "dō" },
];

const benefits = [
  { id: "body", kanji: "体" },
  { id: "mind", kanji: "心" },
  { id: "respect", kanji: "礼" },
  { id: "defense", kanji: "護" },
  { id: "everyone", kanji: "皆" },
  { id: "harmony", kanji: "和" },
];

const rootsEvents: TLEvent[] = [
  { id: "kamakura", year: "1185", kanji: "武", photo: true },
  { id: "edo", year: "1603", kanji: "道", photo: true },
  { id: "meiji", year: "1868", kanji: "新" },
  { id: "daito", year: "1900", kanji: "合", photo: true },
];

const ueshibaFacts = ["born", "died", "titles", "motto"];

const ueshibaEvents: TLEvent[] = [
  { id: "birth", year: "1883", kanji: "生", photo: true },
  { id: "youth", year: "1903", kanji: "鍛" },
  { id: "hokkaido", year: "1912", kanji: "北", photo: true },
  { id: "takeda", year: "1915", kanji: "師" },
  { id: "ayabe", year: "1920", kanji: "神", photo: true },
  { id: "mongolia", year: "1924", kanji: "蒙" },
  { id: "light", year: "1925", kanji: "光" },
  { id: "kobukan", year: "1931", kanji: "館", photo: true },
  { id: "iwama", year: "1942", kanji: "岩", photo: true },
  { id: "aikikai", year: "1948", kanji: "会" },
  { id: "legacy", year: "1969", kanji: "遺", photo: true },
];

const worldEvents: TLEvent[] = [
  { id: "france", year: "1951", kanji: "仏", photo: true },
  { id: "styles", year: "1955", kanji: "派" },
  { id: "today", kanji: "今", photo: true }, // année = texte traduit (aikido.world.today.year)
];

const principles = [
  { id: "maai", kanji: "間" },
  { id: "irimi", kanji: "入" },
  { id: "kuzushi", kanji: "崩" },
  { id: "hara", kanji: "腹" },
  { id: "kokyu", kanji: "息" },
  { id: "zanshin", kanji: "残" },
];

const attacks = [
  { id: "shomen", kanji: "正面打ち" },
  { id: "yokomen", kanji: "横面打ち" },
  { id: "tsuki", kanji: "突き" },
  { id: "katate", kanji: "片手取り" },
  { id: "ryote", kanji: "両手取り" },
  { id: "ushiro", kanji: "後ろ取り" },
];

const classSteps = [
  { id: "rei", kanji: "礼", min: 5 },
  { id: "warmup", kanji: "準", min: 15 },
  { id: "ukemi", kanji: "受", min: 10 },
  { id: "waza", kanji: "技", min: 40 },
  { id: "free", kanji: "乱", min: 15 },
  { id: "calm", kanji: "静", min: 5 },
];

const techniques = [
  { id: "ikkyo", kanji: "一教" },
  { id: "nikyo", kanji: "二教" },
  { id: "sankyo", kanji: "三教" },
  { id: "shihonage", kanji: "四方投げ" },
  { id: "iriminage", kanji: "入身投げ" },
  { id: "kotegaeshi", kanji: "小手返し" },
  { id: "kaitenage", kanji: "回転投げ" },
  { id: "kokyunage", kanji: "呼吸投げ" },
];

const gear = [
  { id: "keikogi", kanji: "稽古着" },
  { id: "obi", kanji: "帯" },
  { id: "hakama", kanji: "袴" },
  { id: "zori", kanji: "草履" },
];

const weapons = [
  { id: "jo", kanji: "杖", cm: 127 },
  { id: "bokken", kanji: "木剣", cm: 100 },
  { id: "tanto", kanji: "短刀", cm: 30 },
];

const faq = ["sport", "comp", "defense", "age", "outfit", "progress"];

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */
function useInView<T extends Element>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

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

/** Écrit --p (0 → 1) sur l'élément : avancement du scroll dans la frise */
function useScrollProgress(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      const r = el.getBoundingClientRect();
      const p = (window.innerHeight * 0.6 - r.top) / r.height;
      el.style.setProperty("--p", String(Math.min(1, Math.max(0, p))));
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref]);
}

const vi = (i: number) => ({ "--i": i }) as CSSProperties;

/* ------------------------------------------------------------------ */
/*  Petits composants                                                  */
/* ------------------------------------------------------------------ */
/** Grille dont les enfants (.rise) apparaissent en cascade */
function Stagger({ className = "", children }: { className?: string; children: ReactNode }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.15);
  return (
    <div ref={ref} data-in={inView} className={`stagger ${className}`}>
      {children}
    </div>
  );
}

function BlockTitle({ kanji, title, lead }: { kanji: string; title: string; lead?: string }) {
  return (
    <ScrollReveal>
      <div className="max-w-3xl">
        <span aria-hidden className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-accent)] text-2xl font-semibold text-white">
          {kanji}
        </span>
        <h3 className="title-underline mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h3>
        {lead && <p className="mt-4 text-base leading-relaxed text-neutral-600 sm:text-lg">{lead}</p>}
      </div>
    </ScrollReveal>
  );
}

/** Placeholder photo (révélée par une « coupe de sabre ») — remplace le bloc role="img" par un <img> */
function Photo({ alt, kanji, ratio = "aspect-[4/3]" }: { alt: string; kanji: string; ratio?: string }) {
  const [ref, inView] = useInView<HTMLElement>(0.2);
  return (
    <figure ref={ref} className="group relative">
      {/* <div data-in={inView} className="cut-reveal overflow-hidden rounded-[2rem]"><img src="/images/aikido/xxx.jpg" alt={alt} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /></div> */}
      <div role="img" aria-label={alt} data-in={inView} className={`photo-placeholder cut-reveal relative flex ${ratio} items-end overflow-hidden rounded-[2rem] border border-[var(--color-border)] p-6`}>
        <p className="relative z-10 max-w-[20rem] text-xs leading-relaxed text-[var(--color-text-muted)]">{alt}</p>
      </div>
      <span aria-hidden className="absolute -bottom-5 -right-3 flex h-16 w-16 rotate-6 items-center justify-center rounded-lg bg-[var(--color-accent)] text-3xl font-semibold text-white shadow-lg transition-transform duration-500 group-hover:rotate-0 sm:-right-5">
        {kanji}
      </span>
    </figure>
  );
}

function Torii({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 120 100" className={className} fill="currentColor">
      <path d="M0 20 Q60 4 120 20 L116 31 Q60 18 4 31 Z" />
      <rect x="14" y="36" width="92" height="7" />
      <rect x="22" y="31" width="9" height="66" />
      <rect x="89" y="31" width="9" height="66" />
    </svg>
  );
}

/* ---------- Frise chronologique à progression au scroll ---------- */
function Timeline({ prefix, events }: { prefix: string; events: TLEvent[] }) {
  const ref = useRef<HTMLOListElement>(null);
  useScrollProgress(ref);
  return (
    <ol ref={ref} className="tl">
      <span aria-hidden className="tl-line" />
      {events.map((ev, i) => (
        <TimelineItem key={ev.id} ev={ev} base={`${prefix}.${ev.id}`} flip={i % 2 === 1} />
      ))}
    </ol>
  );
}

function TimelineItem({ ev, base, flip }: { ev: TLEvent; base: string; flip: boolean }) {
  const { t, i18n } = useTranslation();
  const [ref, inView] = useInView<HTMLLIElement>(0.3);
  return (
    <li ref={ref} data-in={inView} className="tl-item relative pb-16 pl-12 last:pb-0 sm:pl-16">
      <span aria-hidden className="tl-dot" />
      <div className={`grid items-center gap-8 lg:gap-12 ${ev.photo ? "lg:grid-cols-2" : ""}`}>
        <div className="tl-text">
          <p className="flex items-baseline gap-3">
            <span className="text-4xl font-semibold tabular-nums text-[var(--color-accent)] sm:text-5xl">{ev.year ?? t(`${base}.year`)}</span>
            <span aria-hidden className="text-3xl text-neutral-300">{ev.kanji}</span>
          </p>
          <h4 className="mt-3 text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">{t(`${base}.title`)}</h4>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-600">{t(`${base}.text`)}</p>
          {i18n.exists(`${base}.aiki`) && (
            <p className="mt-5 max-w-xl border-l-2 border-[var(--color-accent)] pl-4 text-sm leading-relaxed text-[var(--color-text-muted)]">
              <span className="font-semibold text-[var(--color-accent)]">{t("aikido.aikiLabel")} </span>
              {t(`${base}.aiki`)}
            </p>
          )}
        </div>
        {ev.photo && (
          <div className={flip ? "lg:order-first" : ""}>
            <Photo alt={t(`${base}.alt`)} kanji={ev.kanji} />
          </div>
        )}
      </div>
    </li>
  );
}

/* ---------- Déroulement d'un cours ---------- */
function ClassFlow() {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const step = classSteps[active];
  return (
    <div className="mt-12">
      <div role="tablist" aria-label={t("aikido.flow.title")} className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
        {classSteps.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            id={`tab-${s.id}`}
            aria-selected={i === active}
            aria-controls="flow-panel"
            onClick={() => setActive(i)}
            style={{ flexGrow: s.min, flexBasis: 0 }}
            className={`flex min-w-[4.5rem] flex-col items-start gap-1 rounded-2xl border p-4 text-left transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] ${i === active
                ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                : "border-[var(--color-border)] bg-white hover:border-[var(--color-text)]"
              }`}
          >
            <span aria-hidden className="text-2xl leading-none">{s.kanji}</span>
            <span className={`text-xs font-semibold tabular-nums ${i === active ? "text-white/85" : "text-[var(--color-text-muted)]"}`}>{s.min} min</span>
          </button>
        ))}
      </div>

      <div key={step.id} id="flow-panel" role="tabpanel" aria-labelledby={`tab-${step.id}`} className="panel-in mt-6 grid items-center gap-6 rounded-[2rem] border border-[var(--color-border)] bg-white p-8 sm:p-12 lg:grid-cols-12">
        <span aria-hidden className="text-[7rem] font-semibold leading-none text-[var(--color-accent)] opacity-20 sm:text-[10rem] lg:col-span-3">{step.kanji}</span>
        <div className="lg:col-span-9">
          <p className="text-sm font-semibold text-[var(--color-accent)]">
            {t("aikido.flow.step", { n: active + 1, total: classSteps.length })} · {step.min} min
          </p>
          <h4 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{t(`aikido.flow.steps.${step.id}.title`)}</h4>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">{t(`aikido.flow.steps.${step.id}.text`)}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Armes : barres de longueur animées ---------- */
function Weapons() {
  const { t } = useTranslation();
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  return (
    <div ref={ref} className="space-y-5">
      {weapons.map((w, i) => (
        <div key={w.id} className="blade-card relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white p-6">
          <div className="flex items-start gap-5">
            <span aria-hidden className="flex h-14 min-w-14 items-center justify-center rounded-lg bg-[var(--color-primary)] px-2 text-2xl font-semibold text-white">{w.kanji}</span>
            <div>
              <h4 className="text-xl font-semibold">
                {t(`aikido.weapons.${w.id}.name`)} <span className="text-base font-normal text-neutral-400">· {t(`aikido.weapons.${w.id}.sub`)}</span>
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{t(`aikido.weapons.${w.id}.text`)}</p>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-4">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-surface)]">
              <div className="h-full rounded-full bg-[var(--color-accent)] transition-[width] duration-[1400ms] ease-out" style={{ width: inView ? `${w.cm / 1.3}%` : "0%", transitionDelay: `${i * 150}ms` }} />
            </div>
            <span className="w-20 text-right text-sm font-semibold tabular-nums text-[var(--color-accent)]">≈ {w.cm} cm</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function Aikido() {
  const { t } = useTranslation();
  const active = useActiveSection(sectionIds);

  return (
    <main className="bg-[var(--color-background)] text-[var(--color-text)]">
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden px-6 pb-16 pt-16 sm:pb-20 lg:pt-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <ScrollReveal>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">{t("aikido.about")}</p>
              <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                {t("aikido.titleA")}
                <br />
                <span className="text-neutral-400">{t("aikido.titleB")}</span>
              </h1>
              <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <p className="max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg">{t("aikido.intro")}</p>
                <a href="#essence" className="group inline-flex shrink-0 items-center gap-3 text-sm font-semibold">
                  {t("aikido.explore")}
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 transition-all duration-300 group-hover:border-neutral-950 group-hover:bg-neutral-950 group-hover:text-white">
                    <ArrowDown size={18} />
                  </span>
                </a>
              </div>
            </ScrollReveal>
          </div>

          {/* Kanji tracés à l'encre, puis coupe de sabre */}
          <div aria-hidden className="relative mx-auto flex w-fit items-start justify-center gap-5 overflow-hidden px-8 py-4 lg:col-span-4">
            <p className="flex flex-col text-[4rem] font-semibold leading-[1.05] text-[var(--color-primary)] sm:text-[6rem] lg:text-[7.5rem]">
              {nameChars.map((c, i) => (
                <span key={c.id} className="ink" style={vi(i)}>{c.char}</span>
              ))}
            </p>
            <p className="ink mt-2 text-lg font-medium text-neutral-400 [writing-mode:vertical-rl]" style={vi(3)}>植芝盛平</p>
            <span className="slash" />
          </div>
        </div>
      </section>

      {/* ============ NAV COLLANTE ============ */}
      <nav aria-label={t("aikido.nav")} className="sticky top-[var(--header-h,4.5rem)] z-30 border-y border-[var(--color-border)] bg-white/80 backdrop-blur-md">
        <ul className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-6 py-3 [scrollbar-width:none]">
          {sections.map((s) => {
            const isActive = active === s.id;
            return (
              <li key={s.id} className="shrink-0">
                <a
                  href={`#${s.id}`}
                  aria-current={isActive ? "true" : undefined}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] ${isActive
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                      : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-text)] hover:text-[var(--color-text)]"
                    }`}
                >
                  <span aria-hidden className="text-base leading-none">{s.kanji}</span>
                  {t(`aikido.navItems.${s.id}`)}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ============ 1. L'ESSENTIEL ============ */}
      <section id="essence" className="scroll-mt-32 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <BlockTitle kanji="心" title={t("aikido.essence.title")} lead={t("aikido.essence.lead")} />
          <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b, i) => (
              <div key={b.id} style={vi(i)} className="rise blade-card group relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white p-8 transition-all duration-500 hover:-translate-y-1 hover:border-[var(--color-accent)]">
                <span aria-hidden className="absolute -right-2 -top-4 select-none text-[7rem] font-semibold leading-none text-[var(--color-primary)] opacity-[0.05] transition-all duration-700 group-hover:text-[var(--color-accent)] group-hover:opacity-20">{b.kanji}</span>
                <h4 className="relative text-xl font-semibold">{t(`aikido.essence.benefits.${b.id}.title`)}</h4>
                <p className="relative mt-3 text-sm leading-relaxed text-neutral-600">{t(`aikido.essence.benefits.${b.id}.text`)}</p>
              </div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Le nom */}
      <section className="bg-[var(--color-surface)] px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <BlockTitle kanji="名" title={t("aikido.name.title")} lead={t("aikido.name.lead")} />
          <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
            {nameChars.map((c, i) => (
              <div key={c.id} style={vi(i)} className="rise blade-card group relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white p-8">
                <span aria-hidden className="block text-[8rem] font-semibold leading-none text-[var(--color-primary)] transition-all duration-700 group-hover:scale-105 group-hover:text-[var(--color-accent)]">{c.char}</span>
                <p className="mt-6 text-sm font-semibold text-[var(--color-accent)]">{c.reading} · {t(`aikido.name.chars.${c.id}.meaning`)}</p>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">{t(`aikido.name.chars.${c.id}.text`)}</p>
              </div>
            ))}
          </Stagger>
          <p className="mt-8 text-center text-lg font-medium text-neutral-500">{t("aikido.name.sum")}</p>

          <ScrollReveal>
            <div className="seigaiha-drift relative mt-16 overflow-hidden rounded-[2rem] bg-[var(--color-accent)] p-10 text-white sm:p-16">
              <div className="relative grid items-center gap-8 lg:grid-cols-12">
                <p aria-hidden className="text-5xl font-semibold tracking-widest sm:text-7xl lg:col-span-5">正勝吾勝</p>
                <div className="lg:col-span-7">
                  <p className="text-sm font-semibold text-white/80">Masakatsu Agatsu</p>
                  <p className="mt-3 text-xl font-medium leading-relaxed sm:text-2xl">{t("aikido.name.motto")}</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ============ 2. HISTOIRE : DES SAMOURAÏS AU DAITŌ-RYŪ ============ */}
      <section id="histoire" className="scroll-mt-32 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <BlockTitle kanji="史" title={t("aikido.history.title")} lead={t("aikido.history.lead")} />
          <div className="mt-16">
            <Timeline prefix="aikido.history.roots" events={rootsEvents} />
          </div>
        </div>
      </section>

      {/* ============ 3. UESHIBA ============ */}
      <section id="ueshiba" className="scroll-mt-32 bg-[var(--color-surface)] px-6 py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-12 lg:gap-16">
          <aside className="lg:relative lg:top-40 lg:col-span-4 lg:self-start">  {/*mettre en lg:sticky et corrigé la zone d'arrêt qui est trop basse  */}
            <BlockTitle kanji="翁" title={t("aikido.ueshiba.title")} lead={t("aikido.ueshiba.lead")} />
            <div className="mt-10">
              <Photo alt={t("aikido.ueshiba.alt")} kanji="翁" ratio="aspect-[4/5]" />
            </div>
            <dl className="mt-12 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
              {ueshibaFacts.map((f) => (
                <div key={f} className="flex items-baseline justify-between gap-6 py-4 text-sm">
                  <dt className="text-[var(--color-text-muted)]">{t(`aikido.ueshiba.facts.${f}.label`)}</dt>
                  <dd className="text-right font-medium">{t(`aikido.ueshiba.facts.${f}.value`)}</dd>
                </div>
              ))}
            </dl>
          </aside>
        

          <div className="mt-4 lg:col-span-8">
            <Timeline prefix="aikido.ueshiba.events" events={ueshibaEvents} />
          </div>

          <div className="mt-8 lg:col-span-12">
            <BlockTitle kanji="世" title={t("aikido.world.title")} lead={t("aikido.world.lead")} />
            <div className="mt-14">
              <Timeline prefix="aikido.world" events={worldEvents} />
            </div>
          </div>
        </div>
      </section>

      {/* ============ 4. AUJOURD'HUI ============ */}
      <section id="aujourdhui" className="scroll-mt-32 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl space-y-28">
          <div>
            <BlockTitle kanji="今" title={t("aikido.today.title")} lead={t("aikido.today.lead")} />
          </div>

          {/* Principes */}
          <div>
            <BlockTitle kanji="理" title={t("aikido.principles.title")} lead={t("aikido.principles.lead")} />
            <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {principles.map((p, i) => (
                <div key={p.id} style={vi(i)} className="rise blade-card group relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white p-8 transition-all duration-500 hover:-translate-y-1 hover:border-[var(--color-accent)]">
                  <span aria-hidden className="text-5xl font-semibold leading-none text-[var(--color-accent)] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">{p.kanji}</span>
                  <h4 className="mt-5 text-lg font-semibold">{t(`aikido.principles.items.${p.id}.title`)}</h4>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600">{t(`aikido.principles.items.${p.id}.text`)}</p>
                </div>
              ))}
            </Stagger>
          </div>

          {/* Tori & uke + attaques */}
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <BlockTitle kanji="組" title={t("aikido.partners.title")} />
              <ScrollReveal>
                <p className="mt-6 text-base leading-relaxed text-neutral-600 sm:text-lg">{t("aikido.partners.text")}</p>
                <p className="mt-5 border-l-2 border-[var(--color-accent)] pl-4 text-sm leading-relaxed text-[var(--color-text-muted)]">{t("aikido.partners.ukemi")}</p>
              </ScrollReveal>
            </div>
            <div className="lg:col-span-7">
              <h4 className="text-sm font-semibold text-[var(--color-text-muted)]">{t("aikido.partners.attacksTitle")}</h4>
              <Stagger className="mt-5 grid gap-3 sm:grid-cols-2">
                {attacks.map((a, i) => (
                  <div key={a.id} style={vi(i)} className="rise blade-card relative flex items-center gap-4 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white p-4">
                    <span aria-hidden className="min-w-[5.5rem] text-lg font-semibold text-[var(--color-primary)]">{a.kanji}</span>
                    <div>
                      <p className="text-sm font-semibold">{t(`aikido.partners.attacks.${a.id}.name`)}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{t(`aikido.partners.attacks.${a.id}.meaning`)}</p>
                    </div>
                  </div>
                ))}
              </Stagger>
            </div>
          </div>

          {/* Déroulement */}
          <div>
            <BlockTitle kanji="流" title={t("aikido.flow.title")} lead={t("aikido.flow.lead")} />
            <ClassFlow />
          </div>

          {/* Techniques */}
          <div>
            <BlockTitle kanji="技" title={t("aikido.techniques.title")} lead={t("aikido.techniques.lead")} />
            <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {techniques.map((tech, i) => (
                <div key={tech.id} style={vi(i)} className="rise blade-card group relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white p-7 transition-all duration-500 hover:-translate-y-1 hover:bg-[var(--color-primary)] hover:text-white">
                  <span aria-hidden className="block text-3xl font-semibold leading-tight">{tech.kanji}</span>
                  <h4 className="mt-5 text-lg font-semibold">{t(`aikido.techniques.items.${tech.id}.name`)}</h4>
                  <p className="text-xs font-medium text-[var(--color-accent)] transition-colors duration-500 group-hover:text-white/70">{t(`aikido.techniques.items.${tech.id}.meaning`)}</p>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600 transition-colors duration-500 group-hover:text-white/80">{t(`aikido.techniques.items.${tech.id}.text`)}</p>
                </div>
              ))}
            </Stagger>
            <p className="mt-8 max-w-2xl text-sm leading-relaxed text-[var(--color-text-muted)]">{t("aikido.techniques.note")}</p>
          </div>

          {/* Tenue + armes */}
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-16">
            <div>
              <BlockTitle kanji="衣" title={t("aikido.gear.title")} lead={t("aikido.gear.lead")} />
              <div className="mt-10">
                <Photo alt={t("aikido.gear.alt")} kanji="袴" />
              </div>
              <ul className="mt-12 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
                {gear.map((g) => (
                  <li key={g.id} className="slot-row flex gap-5 py-5">
                    <span aria-hidden className="min-w-16 text-2xl font-semibold text-[var(--color-accent)]">{g.kanji}</span>
                    <div>
                      <p className="font-semibold">{t(`aikido.gear.items.${g.id}.name`)} <span className="font-normal text-neutral-400">· {t(`aikido.gear.items.${g.id}.sub`)}</span></p>
                      <p className="mt-1 text-sm leading-relaxed text-neutral-600">{t(`aikido.gear.items.${g.id}.text`)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <BlockTitle kanji="武" title={t("aikido.weapons.title")} lead={t("aikido.weapons.lead")} />
              <div className="mt-10">
                <Weapons />
              </div>
              <p className="mt-6 text-sm text-[var(--color-text-muted)]">{t("aikido.weapons.note")}</p>
            </div>
          </div>

          {/* FAQ */}
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <BlockTitle kanji="問" title={t("aikido.faq.title")} />
            </div>
            <div className="lg:col-span-8">
              {faq.map((q) => (
                <details key={q} className="group border-b border-[var(--color-border)] py-5 first:border-t [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-medium">
                    {t(`aikido.faq.items.${q}.q`)}
                    <ChevronDown size={20} className="shrink-0 text-[var(--color-accent)] transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <p className="mt-4 max-w-3xl leading-relaxed text-neutral-600">{t(`aikido.faq.items.${q}.a`)}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ 5. CONCLUSION ============ */}
      <section className="relative overflow-hidden bg-[var(--color-primary)] px-6 pb-36 pt-24 text-white sm:pb-44 sm:pt-32">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-6 flex justify-center">
          <Torii className="torii w-72 text-white/[0.07] sm:w-[28rem]" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <ScrollReveal>
            <p aria-hidden className="text-4xl font-semibold tracking-[0.3em] text-white/30">合気道</p>
            <h2 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">{t("aikido.cta.title")}</h2>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">{t("aikido.cta.text")}</p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/cours" className="inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-semibold text-[var(--color-primary)] transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--color-accent)] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                {t("aikido.cta.button")}
                <ArrowUpRight size={18} />
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-3 rounded-full border border-white/40 px-8 py-4 text-sm font-semibold transition-all duration-300 hover:border-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                {t("aikido.cta.contact")}
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}