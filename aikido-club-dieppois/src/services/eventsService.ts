import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.ts";


export const EVENT_CATEGORIES = [
  { id: "stage", kanji: "修", fr: "Stage" },
  { id: "grading", kanji: "段", fr: "Passage de grade" },
  { id: "demo", kanji: "演", fr: "Démonstration" },
  { id: "club", kanji: "和", fr: "Vie du club" },
  { id: "other", kanji: "他", fr: "Autre" },
] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number]["id"];

export type EventSection = { id: string; subtitle: string; body: string };
export type EventPhoto = { id: string; url: string; alt?: string };

export type EventRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: EventCategory;
  event_date: string; // YYYY-MM-DD
  end_date: string | null;
  location: string;
  cover_url: string | null;
  status: "draft" | "published";
  sections: EventSection[];
  photos: EventPhoto[];
  created_at: string;
  updated_at: string;
};
/** Version légère (liste, index, navbar) : sans paragraphes ni photos */
export type EventCard = Omit<EventRow, "sections" | "photos" | "created_at" | "updated_at">;
export type EventDraft = Omit<EventRow, "id" | "created_at" | "updated_at"> & { id?: string };

const CARD_COLUMNS = "id, slug, title, summary, category, event_date, end_date, location, cover_url, status";

/* ------------------------------------------------------------------ */
/*  Requêtes Supabase                                                  */
/* ------------------------------------------------------------------ */
export async function fetchPublishedEvents(): Promise<EventCard[]> {
  const { data, error } = await supabase
    .from("events").select(CARD_COLUMNS).eq("status", "published").order("event_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as EventCard[];
}

/** Admin : brouillons inclus (la RLS ne les renvoie qu'aux utilisateurs connectés) */
export async function fetchAllEventsAdmin(): Promise<EventCard[]> {
  const { data, error } = await supabase.from("events").select(CARD_COLUMNS).order("event_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as EventCard[];
}

export async function fetchEventBySlug(slug: string): Promise<EventRow | null> {
  const { data, error } = await supabase.from("events").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return (data as EventRow | null) ?? null;
}

export async function fetchEventById(id: string): Promise<EventRow | null> {
  const { data, error } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as EventRow | null) ?? null;
}

export async function saveEvent(draft: EventDraft): Promise<EventRow> {
  const { id, ...fields } = draft;
  const query = id
    ? supabase.from("events").update(fields).eq("id", id)
    : supabase.from("events").insert(fields);
  const { data, error } = await query.select("*").single();
  if (error) throw error;
  notifyEventsChanged();
  return data as EventRow;
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
  notifyEventsChanged();
}

/* ------------------------------------------------------------------ */
/*  Navbar : les évènements publiés alimentent le select               */
/* ------------------------------------------------------------------ */
const CHANGED = "events:changed";
export const notifyEventsChanged = () => window.dispatchEvent(new Event(CHANGED));

/** Renvoie les `limit` évènements publiés les plus récents, au format de la navbar */
export function useEventNavLinks(limit = 10) {
  const [links, setLinks] = useState<{ to: string; label: string }[]>([]);
  useEffect(() => {
    let alive = true;
    const load = () =>
      fetchPublishedEvents()
        .then((rows) => alive && setLinks(rows.slice(0, limit).map((e) => ({ to: `/evenements/${e.slug}`, label: e.title }))))
        .catch(() => { });
    load();
    window.addEventListener(CHANGED, load);
    return () => {
      alive = false;
      window.removeEventListener(CHANGED, load);
    };
  }, [limit]);
  return links;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
export const slugify = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const parse = (s: string) => new Date(`${s}T00:00:00`);
export const daysUntil = (s: string) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((parse(s).getTime() - today.getTime()) / 86_400_000);
};
export const isUpcoming = (e: { event_date: string; end_date: string | null }) => daysUntil(e.end_date ?? e.event_date) >= 0;

export function formatEventDate(start: string, end: string | null, lang: string) {
  const f = (d: Date, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(lang, o).format(d);
  const full: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
  const s = parse(start);
  if (!end || end === start) return f(s, full);
  const e = parse(end);
  if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) return `${s.getDate()} – ${f(e, full)}`;
  if (s.getFullYear() === e.getFullYear()) return `${f(s, { day: "numeric", month: "long" })} – ${f(e, full)}`;
  return `${f(s, full)} – ${f(e, full)}`;
}

/* ------------------------------------------------------------------ */
/*  Mise en page automatique                                           */
/*  Règles (nombre de photos et de paragraphes variables) :            */
/*   1. les photos sont réparties régulièrement entre les paragraphes  */
/*   2. au plus 3 photos par paragraphe (grappe 1 / 2 / 3 photos)      */
/*   3. le surplus part dans une galerie finale (mosaïque)             */
/*   4. les grappes alternent gauche / droite                          */
/*   5. un paragraphe sans photo passe en colonne « éditoriale »       */
/* ------------------------------------------------------------------ */
export const MAX_PHOTOS_PER_SECTION = 3;
export type IndexedPhoto = { photo: EventPhoto; index: number };
export type PlannedSection = { section: EventSection; photos: IndexedPhoto[]; flip: boolean };
export type LayoutPlan = { sections: PlannedSection[]; gallery: IndexedPhoto[] };

export function planLayout(sections: EventSection[], photos: EventPhoto[]): LayoutPlan {
  const indexed = photos.map((photo, index) => ({ photo, index }));
  const n = sections.length;
  if (n === 0) return { sections: [], gallery: indexed };

  const gallery: IndexedPhoto[] = [];
  let side = 0;
  const planned = sections.map((section, i) => {
    const chunk = indexed.slice(Math.round((i * indexed.length) / n), Math.round(((i + 1) * indexed.length) / n));
    gallery.push(...chunk.slice(MAX_PHOTOS_PER_SECTION));
    const kept = chunk.slice(0, MAX_PHOTOS_PER_SECTION);
    const flip = kept.length > 0 && side++ % 2 === 1;
    return { section, photos: kept, flip };
  });
  return { sections: planned, gallery: gallery.sort((a, b) => a.index - b.index) };
}