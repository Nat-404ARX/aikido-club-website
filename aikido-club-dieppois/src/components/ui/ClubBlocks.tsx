import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "./Motion.tsx";
import type {
  ClubBlock, ClubImage, ImagesBlock, QuoteBlock, StatsBlock, TextBlock, TimelineBlock,
} from "../../lib/club.ts";

export type OpenImages = (photos: ClubImage[], index: number) => void;

function Prose({ body }: { body: string }) {
  return (
    <div className="space-y-5 break-words text-base leading-relaxed text-neutral-600 sm:text-lg">
      {body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean).map((p, i) => (
        <p key={i} className="whitespace-pre-line">{p}</p>
      ))}
    </div>
  );
}

function TextView({ block }: { block: TextBlock }) {
  if (!block.body.trim() && !block.subtitle.trim()) return null;
  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:gap-12">
      {block.subtitle && (
        <h3 className="title-underline min-w-0 break-words text-2xl font-semibold leading-snug tracking-tight sm:text-3xl lg:col-span-4">
          {block.subtitle}
        </h3>
      )}
      <div className={`min-w-0 lg:col-span-8 ${block.subtitle ? "" : "lg:col-start-5"}`}>
        <Prose body={block.body} />
      </div>
    </div>
  );
}

function Img({ photo, onOpen, className = "", natural = false }: { photo: ClubImage; onOpen: () => void; className?: string; natural?: boolean }) {
  const { t } = useTranslation();
  const [ref, inView] = useInView<HTMLButtonElement>(0.12);
  return (
    <button
      ref={ref} type="button" data-in={inView} onClick={onOpen} aria-label={t("club.lightbox.open")}
      className={`cut-reveal group block w-full overflow-hidden rounded-[1.5rem] bg-[var(--color-surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)] ${className}`}
    >
      <img
        src={photo.url} alt={photo.alt} loading="lazy" decoding="async"
        className={`w-full transition-transform duration-700 group-hover:scale-105 ${natural ? "h-auto" : "h-full object-cover"}`}
      />
    </button>
  );
}

function ImagesView({ block, onOpen }: { block: ImagesBlock; onOpen: OpenImages }) {
  const imgs = block.images;
  const n = imgs.length;
  if (n === 0) return null;
  const open = (i: number) => () => onOpen(imgs, i);
  return (
    <figure>
      {n === 1 && <Img photo={imgs[0]} onOpen={open(0)} className="aspect-[4/3] sm:aspect-[16/8]" />}
      {n === 2 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Img photo={imgs[0]} onOpen={open(0)} className="aspect-[4/3]" />
          <Img photo={imgs[1]} onOpen={open(1)} className="aspect-[4/3] sm:mt-12" />
        </div>
      )}
      {n === 3 && (
        <div className="grid grid-cols-2 gap-4">
          <Img photo={imgs[0]} onOpen={open(0)} className="col-span-2 aspect-[16/9]" />
          <Img photo={imgs[1]} onOpen={open(1)} className="aspect-square" />
          <Img photo={imgs[2]} onOpen={open(2)} className="aspect-square" />
        </div>
      )}
      {n >= 4 && (
        <div className="columns-2 gap-4 md:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">
          {imgs.map((p, i) => <Img key={p.id} photo={p} onOpen={open(i)} natural />)}
        </div>
      )}
      {block.caption && <figcaption className="mt-4 break-words text-sm text-[var(--color-text-muted)]">{block.caption}</figcaption>}
    </figure>
  );
}

function TimelineRow({ item, last }: { item: TimelineBlock["items"][number]; last: boolean }) {
  const [ref, inView] = useInView<HTMLLIElement>(0.3);
  return (
    <li ref={ref} data-in={inView} className="group grid grid-cols-[3.75rem_1.25rem_minmax(0,1fr)] gap-x-4 sm:grid-cols-[6.5rem_1.25rem_minmax(0,1fr)] sm:gap-x-6">
      <p className="break-words pt-0.5 text-right text-lg font-semibold tabular-nums text-[var(--color-accent)] sm:text-3xl">{item.year}</p>
      {/* colonne centrale : point + trait, en flux normal (flex) */}
      <div className="flex flex-col items-center">
        <span className="mt-2 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-[var(--color-accent)] bg-white transition-all duration-500 group-data-[in=true]:scale-125 group-data-[in=true]:bg-[var(--color-accent)]" />
        {!last && <span className="mt-2 w-0.5 flex-1 origin-top scale-y-0 bg-[var(--color-accent)] transition-transform duration-1000 group-data-[in=true]:scale-y-100" />}
      </div>
      <div className={`min-w-0 ${last ? "" : "pb-12"}`}>
        <h4 className="break-words text-xl font-semibold leading-snug sm:text-2xl">{item.title}</h4>
        {item.text && <p className="mt-3 max-w-xl whitespace-pre-line break-words leading-relaxed text-neutral-600">{item.text}</p>}
      </div>
    </li>
  );
}

function TimelineView({ block }: { block: TimelineBlock }) {
  if (block.items.length === 0) return null;
  return (
    <ol className="mx-auto max-w-4xl">
      {block.items.map((it, i) => <TimelineRow key={it.id} item={it} last={i === block.items.length - 1} />)}
    </ol>
  );
}

function CountUp({ value }: { value: string }) {
  const m = value.match(/^(\D*)(\d+)(\D*)$/);
  const target = m ? Number(m[2]) : 0;
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animate = !!m && target > 0 && !(target >= 1900 && target <= 2100) && !reduce;
  const [ref, inView] = useInView<HTMLSpanElement>(0.5);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView || !animate) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / 1400);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, animate, target]);

  return <span ref={ref}>{animate && m ? `${m[1]}${n}${m[3]}` : value}</span>;
}

function StatsView({ block }: { block: StatsBlock }) {
  if (block.items.length === 0) return null;
  return (
    <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {block.items.map((s) => (
        <li key={s.id} className="blade-card relative min-w-0 overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white p-6 sm:p-8">
          <p className="break-words text-4xl font-semibold tabular-nums tracking-tight text-[var(--color-accent)] sm:text-5xl"><CountUp value={s.value} /></p>
          <p className="mt-3 break-words text-sm leading-snug text-neutral-600">{s.label}</p>
        </li>
      ))}
    </ul>
  );
}

function QuoteView({ block }: { block: QuoteBlock }) {
  if (!block.text.trim()) return null;
  return (
    <figure className="seigaiha-drift relative overflow-hidden rounded-[2rem] bg-[var(--color-accent)] px-6 py-14 text-center text-white sm:px-16 sm:py-20">
      <div className="relative mx-auto max-w-3xl">
        <span aria-hidden className="block text-7xl font-semibold leading-none text-white/40">“</span>
        <blockquote className="break-words text-2xl font-medium leading-snug sm:text-4xl">{block.text}</blockquote>
        {block.author && <figcaption className="mt-8 text-sm font-semibold text-white/85">{block.author}</figcaption>}
      </div>
    </figure>
  );
}

export function BlockView({ block, onOpen }: { block: ClubBlock; onOpen: OpenImages }) {
  switch (block.type) {
    case "text": return <TextView block={block} />;
    case "images": return <ImagesView block={block} onOpen={onOpen} />;
    case "timeline": return <TimelineView block={block} />;
    case "stats": return <StatsView block={block} />;
    case "quote": return <QuoteView block={block} />;
  }
}