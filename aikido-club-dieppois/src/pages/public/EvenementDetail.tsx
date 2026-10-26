import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, ArrowUpRight, Calendar, ChevronLeft, ChevronRight, MapPin, X } from "lucide-react";
import ScrollReveal from "../../components/ui/ScrollReveal.tsx";
import { useInView } from "../../components/ui/Motion.tsx";
import {
  EVENT_CATEGORIES, fetchEventBySlug, fetchPublishedEvents, formatEventDate, isUpcoming, planLayout,
  type EventCard, type EventRow, type IndexedPhoto, type PlannedSection,
} from "../../services/eventsService.ts";

type OpenFn = (index: number) => void;

function Img({ item, onOpen, className = "", natural = false }: { item: IndexedPhoto; onOpen: OpenFn; className?: string; natural?: boolean }) {
  const { t } = useTranslation();
  const [ref, inView] = useInView<HTMLButtonElement>(0.12);
  return (
    <button
      ref={ref} type="button" data-in={inView} onClick={() => onOpen(item.index)} aria-label={t("evenements.detail.open")}
      className={`cut-reveal group relative block w-full overflow-hidden rounded-[1.5rem] bg-[var(--color-surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)] ${className}`}
    >
      <img
        src={item.photo.url} alt={item.photo.alt ?? ""} loading="lazy" decoding="async"
        className={`w-full transition-transform duration-700 group-hover:scale-105 ${natural ? "h-auto" : "h-full object-cover"}`}
      />
    </button>
  );
}

/** Grappe de 1, 2 ou 3 photos */
function Cluster({ photos, onOpen }: { photos: IndexedPhoto[]; onOpen: OpenFn }) {
  if (photos.length === 1)
    return <Img item={photos[0]} onOpen={onOpen} className="aspect-[4/3] lg:aspect-[4/5]" />;
  if (photos.length === 2)
    return (
      <div className="grid grid-cols-5 items-start gap-4">
        <Img item={photos[0]} onOpen={onOpen} className="col-span-3 aspect-[3/4]" />
        <Img item={photos[1]} onOpen={onOpen} className="col-span-2 mt-12 aspect-[3/4] sm:mt-16" />
      </div>
    );
  return (
    <div className="grid grid-cols-2 gap-4">
      <Img item={photos[0]} onOpen={onOpen} className="col-span-2 aspect-[16/10]" />
      <Img item={photos[1]} onOpen={onOpen} className="aspect-square" />
      <Img item={photos[2]} onOpen={onOpen} className="aspect-square" />
    </div>
  );
}

/** Texte : les lignes vides séparent les paragraphes */
function Prose({ body }: { body: string }) {
  return (
    <div className="space-y-5 text-base leading-relaxed text-neutral-600 sm:text-lg">
      {body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean).map((p, i) => (
        <p key={i} className="whitespace-pre-line">{p}</p>
      ))}
    </div>
  );
}

function SectionBlock({ item, onOpen }: { item: PlannedSection; onOpen: OpenFn }) {
  const { section, photos, flip } = item;
  const title = section.subtitle && (
    <h2 className="title-underline text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{section.subtitle}</h2>
  );

  // Paragraphe sans photo : colonne éditoriale (sous-titre à gauche, texte à droite)
  if (photos.length === 0)
    return (
      <ScrollReveal>
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">{title}</div>
          <div className="max-w-3xl lg:col-span-8"><Prose body={section.body} /></div>
        </div>
      </ScrollReveal>
    );

  return (
    <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
      <div className={`lg:col-span-7 ${flip ? "lg:order-2" : ""}`}><Cluster photos={photos} onOpen={onOpen} /></div>
      <div className={`lg:col-span-5 ${flip ? "lg:order-1" : ""}`}>
        <ScrollReveal>
          {title}
          <div className={title ? "mt-6" : ""}><Prose body={section.body} /></div>
        </ScrollReveal>
      </div>
    </div>
  );
}

/* ---------- Visionneuse plein écran ---------- */
function Lightbox({ photos, index, onIndex, onClose }: { photos: EventRow["photos"]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const { t } = useTranslation();
  const n = photos.length;
  const go = (d: number) => onIndex((index + d + n) % n);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  });
  const p = photos[index];
  const btn = "flex h-12 w-12 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-white";
  return (
    <div role="dialog" aria-modal="true" aria-label={t("evenements.detail.gallery")} className="lightbox-in fixed inset-0 z-[100] flex flex-col bg-black/95 p-4 sm:p-8" onClick={onClose}>
      <div className="flex items-center justify-between text-sm text-white/70" onClick={(e) => e.stopPropagation()}>
        <span className="tabular-nums">{t("evenements.detail.photoOf", { n: index + 1, total: n })}</span>
        <button type="button" onClick={onClose} aria-label={t("evenements.detail.close")} className={btn}><X size={20} /></button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center">
        <img key={p.id} src={p.url} alt={p.alt ?? ""} className="panel-in max-h-full max-w-full rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
      </div>
      {p.alt && <p className="mt-3 text-center text-sm text-white/80">{p.alt}</p>}
      {n > 1 && (
        <div className="mt-4 flex justify-center gap-4" onClick={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => go(-1)} aria-label={t("evenements.detail.prevPhoto")} className={btn}><ChevronLeft size={22} /></button>
          <button type="button" onClick={() => go(1)} aria-label={t("evenements.detail.nextPhoto")} className={btn}><ChevronRight size={22} /></button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
export default function EvenementDetail() {
  const { slug = "" } = useParams();
  const { t, i18n } = useTranslation();
  const [event, setEvent] = useState<EventRow | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [all, setAll] = useState<EventCard[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [coverRef, coverIn] = useInView<HTMLDivElement>(0.1);

  useEffect(() => {
    let alive = true;
    setState("loading"); setOpen(null); window.scrollTo({ top: 0 });
    fetchEventBySlug(slug)
      .then((row) => { if (!alive) return; setEvent(row); setState(row ? "ready" : "missing"); if (row) document.title = row.title; })
      .catch(() => alive && setState("error"));
    fetchPublishedEvents().then((rows) => alive && setAll(rows)).catch(() => { });
    return () => { alive = false; };
  }, [slug]);

  if (state === "loading")
    return (
      <main aria-busy="true" className="px-6 pt-20"><div className="mx-auto max-w-7xl space-y-6">
        <div className="h-6 w-40 animate-pulse rounded bg-[var(--color-surface)]" />
        <div className="h-24 max-w-3xl animate-pulse rounded-2xl bg-[var(--color-surface)]" />
        <div className="aspect-[16/8] animate-pulse rounded-[2rem] bg-[var(--color-surface)]" />
      </div></main>
    );

  if (state !== "ready" || !event)
    return (
      <main className="px-6 pb-44 pt-28 text-center">
        <span aria-hidden className="text-8xl font-semibold text-neutral-200">無</span>
        <h1 className="mt-6 text-3xl font-semibold">{t(state === "error" ? "evenements.detail.errorTitle" : "evenements.detail.missingTitle")}</h1>
        <p className="mx-auto mt-3 max-w-md text-[var(--color-text-muted)]">{t(state === "error" ? "evenements.detail.errorText" : "evenements.detail.missingText")}</p>
        <Link to="/evenements" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold"><ArrowLeft size={16} />{t("evenements.detail.back")}</Link>
      </main>
    );

  const cat = EVENT_CATEGORIES.find((c) => c.id === event.category) ?? EVENT_CATEGORIES[4];
  const plan = planLayout(event.sections, event.photos);
  const cover = event.cover_url ?? event.photos[0]?.url ?? null;
  const i = all.findIndex((e) => e.slug === event.slug);
  const newer = i > 0 ? all[i - 1] : null;
  const older = i >= 0 && i < all.length - 1 ? all[i + 1] : null;

  return (
    <main className="bg-[var(--color-background)] text-[var(--color-text)]">
      {/* ============ EN-TÊTE ============ */}
      <section className="relative px-6 pb-10 pt-16 sm:pb-14 lg:pt-20">
        <div className="mx-auto max-w-7xl">
          <Link to="/evenements" className="group inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]">
            <ArrowLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-1" />{t("evenements.detail.back")}
          </Link>

          {event.status === "draft" && (
            <p role="status" className="mt-6 rounded-2xl border border-dashed border-[var(--color-accent)] bg-[var(--color-surface)] px-5 py-3 text-sm font-medium text-[var(--color-accent)]">
              {t("evenements.detail.draft")}
            </p>
          )}

          <ScrollReveal>
            <div className="mt-10 grid items-end gap-10 lg:grid-cols-12">
              <div className="lg:col-span-9">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-medium text-[var(--color-text-muted)]">
                    <span aria-hidden className="text-sm">{cat.kanji}</span>{t(`evenements.categories.${cat.id}`)}
                  </span>
                  {isUpcoming(event) && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-accent)]"><span className="live-dot" aria-hidden />{t("evenements.upcoming")}</span>
                  )}
                </div>
                <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">{event.title}</h1>
                {event.summary && <p className="mt-6 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">{event.summary}</p>}
              </div>
              <dl className="space-y-4 text-sm lg:col-span-3">
                <div className="flex gap-3"><Calendar size={18} className="mt-0.5 shrink-0 text-[var(--color-accent)]" aria-hidden />
                  <div><dt className="text-[var(--color-text-muted)]">{t("evenements.detail.when")}</dt><dd className="font-medium">{formatEventDate(event.event_date, event.end_date, i18n.language)}</dd></div></div>
                {event.location && (
                  <div className="flex gap-3"><MapPin size={18} className="mt-0.5 shrink-0 text-[var(--color-accent)]" aria-hidden />
                    <div><dt className="text-[var(--color-text-muted)]">{t("evenements.detail.where")}</dt><dd className="font-medium">{event.location}</dd></div></div>
                )}
              </dl>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ============ COUVERTURE ============ */}
      <div className="px-6">
        <div ref={coverRef} data-in={coverIn} className="cut-reveal cover-zoom mx-auto aspect-[4/3] max-w-7xl overflow-hidden rounded-[2rem] sm:aspect-[16/8]">
          {cover ? (
            <img src={cover} alt={event.title} decoding="async" className="h-full w-full object-cover" />
          ) : (
            <div className="photo-placeholder flex h-full w-full items-center justify-center"><span aria-hidden className="text-[12rem] font-semibold leading-none opacity-25">{cat.kanji}</span></div>
          )}
        </div>
      </div>

      {/* ============ PARAGRAPHES + PHOTOS ============ */}
      {plan.sections.length > 0 && (
        <section className="px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl space-y-24 sm:space-y-32">
            {plan.sections.map((s) => <SectionBlock key={s.section.id} item={s} onOpen={setOpen} />)}
          </div>
        </section>
      )}

      {/* ============ GALERIE (surplus de photos, ou évènement sans texte) ============ */}
      {plan.gallery.length > 0 && (
        <section className={`px-6 pb-20 sm:pb-28 ${plan.sections.length === 0 ? "pt-20 sm:pt-28" : "bg-[var(--color-surface)] pt-20 sm:pt-28"}`}>
          <div className="mx-auto max-w-7xl">
            <h2 className="title-underline text-3xl font-semibold tracking-tight sm:text-4xl">{t("evenements.detail.gallery")}</h2>
            <div className="mt-12 columns-2 gap-4 md:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">
              {plan.gallery.map((g) => <Img key={g.photo.id} item={g} onOpen={setOpen} natural />)}
            </div>
          </div>
        </section>
      )}

      {/* ============ PRÉCÉDENT / SUIVANT ============ */}
      <section className="relative overflow-hidden bg-[var(--color-primary)] px-6 pb-36 pt-20 text-white sm:pb-44 sm:pt-28">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
          {[{ ev: older, label: "prev", Icon: ArrowLeft }, { ev: newer, label: "next", Icon: ArrowRight }].map(({ ev, label, Icon }) =>
            ev ? (
              <Link key={label} to={`/evenements/${ev.slug}`} className={`group rounded-3xl border border-white/20 p-8 transition-all duration-500 hover:border-white hover:bg-white/5 ${label === "next" ? "md:text-right" : ""}`}>
                <p className={`flex items-center gap-2 text-sm text-white/60 ${label === "next" ? "md:justify-end" : ""}`}>
                  {label === "prev" && <Icon size={16} className="transition-transform duration-300 group-hover:-translate-x-1" />}
                  {t(`evenements.detail.${label}`)}
                  {label === "next" && <Icon size={16} className="transition-transform duration-300 group-hover:translate-x-1" />}
                </p>
                <p className="mt-3 text-2xl font-semibold leading-snug sm:text-3xl">{ev.title}</p>
              </Link>
            ) : <span key={label} aria-hidden className="hidden md:block" />,
          )}
        </div>
        <div className="mt-12 text-center">
          <Link to="/evenements" className="inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-semibold text-[var(--color-primary)] transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--color-accent)] hover:text-white">
            {t("evenements.detail.allEvents")}<ArrowUpRight size={18} />
          </Link>
        </div>
      </section>

      {open !== null && <Lightbox photos={event.photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </main>
  );
}