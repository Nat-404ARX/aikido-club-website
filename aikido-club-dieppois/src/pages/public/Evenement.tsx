import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowDown, ArrowUpRight, MapPin, RefreshCw, Search } from "lucide-react";
import ScrollReveal from "../../components/ui/ScrollReveal.tsx";
import { Stagger, vi } from "../../components/ui/Motion.tsx";
import {
  EVENT_CATEGORIES, daysUntil, fetchPublishedEvents, formatEventDate, isUpcoming, normalize,
  type EventCard, type EventCategory,
} from "../../services/eventsService.ts";

const heroChars = ["行", "事"];
const kanjiOf = (c: EventCategory) => EVENT_CATEGORIES.find((x) => x.id === c)?.kanji ?? "他";

/* ---------- Prochain évènement (mis en avant) ---------- */
function Featured({ event }: { event: EventCard }) {
  const { t, i18n } = useTranslation();
  const d = daysUntil(event.event_date);
  return (
    <ScrollReveal>
      <Link
        to={`/evenements/${event.slug}`}
        className="group blade-card relative grid overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)] lg:grid-cols-12"
      >
        <div className="relative aspect-[4/3] overflow-hidden lg:col-span-7 lg:aspect-auto lg:min-h-[26rem]">
          {event.cover_url ? (
            <img src={event.cover_url} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div className="photo-placeholder flex h-full w-full items-center justify-center">
              <span aria-hidden className="text-[10rem] font-semibold leading-none opacity-30">{kanjiOf(event.category)}</span>
            </div>
          )}
          <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-4 py-1.5 text-xs font-semibold text-white">
            <span className="live-dot" aria-hidden />
            {d <= 0 ? t("evenements.now") : t("evenements.inDays", { count: d })}
          </span>
        </div>

        <div className="flex flex-col justify-center p-8 sm:p-12 lg:col-span-5">
          <p className="text-sm font-semibold text-[var(--color-accent)]">{t("evenements.next")}</p>
          <h3 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{event.title}</h3>
          <p className="mt-4 text-sm font-medium text-neutral-500">{formatEventDate(event.event_date, event.end_date, i18n.language)}</p>
          {event.location && (
            <p className="mt-1 inline-flex items-center gap-2 text-sm text-neutral-500"><MapPin size={14} aria-hidden />{event.location}</p>
          )}
          {event.summary && <p className="mt-5 leading-relaxed text-neutral-600">{event.summary}</p>}
          <span className="mt-8 inline-flex items-center gap-3 text-sm font-semibold">
            {t("evenements.discover")}
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 transition-all duration-300 group-hover:border-[var(--color-accent)] group-hover:bg-[var(--color-accent)] group-hover:text-white">
              <ArrowUpRight size={18} className="transition-transform duration-300 group-hover:rotate-45" />
            </span>
          </span>
        </div>
      </Link>
    </ScrollReveal>
  );
}

/* ---------- Ligne de l'index ---------- */
function IndexRow({ event, i }: { event: EventCard; i: number }) {
  const { t, i18n } = useTranslation();
  const date = new Date(`${event.event_date}T00:00:00`);
  const day = new Intl.DateTimeFormat(i18n.language, { day: "2-digit" }).format(date);
  const month = new Intl.DateTimeFormat(i18n.language, { month: "short" }).format(date);
  const upcoming = isUpcoming(event);
  return (
    <div role="listitem" style={vi(i)} className="rise">
      <Link
        to={`/evenements/${event.slug}`}
        className="group flex items-center gap-4 py-6 transition-[padding] duration-300 hover:pl-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] sm:gap-6"
      >
        <div className="w-14 shrink-0 text-center sm:w-20">
          <p className="text-3xl font-semibold tabular-nums leading-none sm:text-4xl">{day}</p>
          <p className="mt-1 text-xs font-semibold uppercase text-[var(--color-text-muted)]">{month}</p>
        </div>

        <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[var(--color-surface)] transition-all duration-500 sm:w-0 sm:opacity-0 sm:group-hover:w-28 sm:group-hover:opacity-100 sm:group-focus-visible:w-28 sm:group-focus-visible:opacity-100">
          {event.cover_url ? (
            <img src={event.cover_url} alt="" loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <span aria-hidden className="flex h-full w-full items-center justify-center text-2xl text-[var(--color-accent)]">{kanjiOf(event.category)}</span>
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[var(--color-border)] px-3 py-0.5 text-xs font-medium text-[var(--color-text-muted)]">
              {t(`evenements.categories.${event.category}`)}
            </span>
            {upcoming && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-accent)]">
                <span className="live-dot" aria-hidden />{t("evenements.upcoming")}
              </span>
            )}
          </div>
          <h4 className="mt-2 truncate text-lg font-semibold sm:text-xl">{event.title}</h4>
          {event.location && <p className="truncate text-sm text-[var(--color-text-muted)]">{event.location}</p>}
        </div>

        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-neutral-300 transition-all duration-300 group-hover:border-neutral-950 group-hover:bg-neutral-950 group-hover:text-white">
          <ArrowUpRight size={18} className="transition-transform duration-300 group-hover:rotate-45" />
        </span>
      </Link>
    </div>
  );
}

export default function Evenement() {
  const { t } = useTranslation();
  const [events, setEvents] = useState<EventCard[]>([]);
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");
  const [cat, setCat] = useState<"all" | EventCategory>("all");
  const [q, setQ] = useState("");

  const load = () => {
    setState("loading");
    fetchPublishedEvents().then((rows) => { setEvents(rows); setState("ready"); }).catch(() => setState("error"));
  };
  useEffect(load, []);

  const featured = useMemo(
    () => events.filter(isUpcoming).sort((a, b) => a.event_date.localeCompare(b.event_date))[0],
    [events],
  );
  const presentCats = useMemo(() => EVENT_CATEGORIES.filter((c) => events.some((e) => e.category === c.id)), [events]);
  const filtered = useMemo(
    () => events.filter((e) =>
      (cat === "all" || e.category === cat) &&
      (!q || normalize(`${e.title} ${e.location} ${e.summary}`).includes(normalize(q))),
    ),
    [events, cat, q],
  );
  const groups = useMemo(() => {
    const m = new Map<string, EventCard[]>();
    filtered.forEach((e) => { const y = e.event_date.slice(0, 4); m.set(y, [...(m.get(y) ?? []), e]); });
    return [...m.entries()];
  }, [filtered]);

  return (
    <main className="bg-[var(--color-background)] text-[var(--color-text)]">
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden px-6 pb-16 pt-16 sm:pb-20 lg:pt-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <ScrollReveal>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">{t("evenements.about")}</p>
              <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                {t("evenements.titleA")}
                <br />
                <span className="text-neutral-400">{t("evenements.titleB")}</span>
              </h1>
              <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <p className="max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg">{t("evenements.intro")}</p>
                <a href="#index" className="group inline-flex shrink-0 items-center gap-3 text-sm font-semibold">
                  {t("evenements.explore")}
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

      {/* ============ PROCHAIN ÉVÈNEMENT ============ */}
      {state === "ready" && featured && (
        <section className="px-6 pb-20 sm:pb-24">
          <div className="mx-auto max-w-7xl"><Featured event={featured} /></div>
        </section>
      )}

      {/* ============ FILTRES COLLANTS ============ */}
      <div id="index" className="sticky top-[var(--header-h,4.5rem)] z-30 scroll-mt-24 border-y border-[var(--color-border)] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div role="tablist" aria-label={t("evenements.filterLabel")} className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
            {[{ id: "all" as const, kanji: "全" }, ...presentCats].map((c) => {
              const active = cat === c.id;
              return (
                <button
                  key={c.id} type="button" role="tab" aria-selected={active} onClick={() => setCat(c.id)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] ${active ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                      : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-text)] hover:text-[var(--color-text)]"}`}
                >
                  <span aria-hidden className="text-base leading-none">{c.kanji}</span>
                  {c.id === "all" ? t("evenements.all") : t(`evenements.categories.${c.id}`)}
                </button>
              );
            })}
          </div>
          <label className="relative block lg:w-72">
            <span className="sr-only">{t("evenements.search")}</span>
            <Search size={16} aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("evenements.search")}
              className="w-full rounded-full border border-[var(--color-border)] bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-accent)]"
            />
          </label>
        </div>
      </div>

      {/* ============ INDEX PAR ANNÉE ============ */}
      <section className="px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between gap-6">
            <h2 className="title-underline text-3xl font-semibold tracking-tight sm:text-4xl">{t("evenements.indexTitle")}</h2>
            {state === "ready" && <p className="text-sm text-[var(--color-text-muted)]">{t("evenements.count", { count: filtered.length })}</p>}
          </div>

          {state === "loading" && (
            <div aria-busy="true" className="space-y-4">
              {[0, 1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-[var(--color-surface)]" style={{ animationDelay: `${i * 120}ms` } as CSSProperties} />)}
            </div>
          )}

          {state === "error" && (
            <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center">
              <p className="text-lg font-medium">{t("evenements.error")}</p>
              <button type="button" onClick={load} className="mt-6 inline-flex items-center gap-2 rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold transition-colors hover:border-neutral-950 hover:bg-neutral-950 hover:text-white">
                <RefreshCw size={16} aria-hidden />{t("evenements.retry")}
              </button>
            </div>
          )}

          {state === "ready" && events.length === 0 && (
            <div className="rounded-3xl border border-dashed border-[var(--color-border)] p-14 text-center">
              <span aria-hidden className="text-7xl font-semibold text-neutral-200">空</span>
              <p className="mt-4 text-xl font-semibold">{t("evenements.emptyTitle")}</p>
              <p className="mx-auto mt-2 max-w-md text-[var(--color-text-muted)]">{t("evenements.emptyText")}</p>
            </div>
          )}

          {state === "ready" && events.length > 0 && groups.length === 0 && (
            <p className="py-10 text-center text-[var(--color-text-muted)]">{t("evenements.noResult")}</p>
          )}

          {state === "ready" && groups.map(([year, items]) => (
            <div key={year} className="grid gap-4 border-t border-[var(--color-border)] py-8 lg:grid-cols-12 lg:gap-10">
              <h3 className="text-5xl font-semibold tabular-nums text-neutral-300 lg:sticky lg:top-40 lg:col-span-2 lg:self-start">{year}</h3>
              <Stagger className="divide-y divide-[var(--color-border)] lg:col-span-10">
                {items.map((e, i) => <IndexRow key={e.id} event={e} i={i} />)}
              </Stagger>
            </div>
          ))}
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative overflow-hidden bg-[var(--color-primary)] px-6 pb-36 pt-24 text-white sm:pb-44 sm:pt-32">
        <div className="relative mx-auto max-w-4xl text-center">
          <ScrollReveal>
            <h2 className="text-4xl font-semibold tracking-tight sm:text-6xl">{t("evenements.ctaTitle")}</h2>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">{t("evenements.ctaText")}</p>
            <Link to="/contact" className="mt-10 inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-semibold text-[var(--color-primary)] transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--color-accent)] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              {t("evenements.ctaButton")}<ArrowUpRight size={18} />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}