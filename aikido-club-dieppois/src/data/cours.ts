import { supabase } from "../lib/supabase.ts";

export const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type DayKey = (typeof DAYS)[number];
export const DAY_SHORT: Record<DayKey, string> = { mon: "LUN", tue: "MAR", wed: "MER", thu: "JEU", fri: "VEN", sat: "SAM", sun: "DIM" };
export const DAY_FR: Record<DayKey, string> = { mon: "Lundi", tue: "Mardi", wed: "Mercredi", thu: "Jeudi", fri: "Vendredi", sat: "Samedi", sun: "Dimanche" };

export type CourseLang = "fr" | "en";
export const COURSE_LANGS: { id: CourseLang; label: string }[] = [{ id: "fr", label: "Français" }, { id: "en", label: "English" }];

/** start / end : « HH:MM » ou null (affiché « À compléter ») */
export type CourseSlot = { id: string; day: DayKey; start: string | null; end: string | null };
export type CourseText = { name: string; audience: string; tag: string; description: string; alt: string };
export const EMPTY_TEXT: CourseText = { name: "", audience: "", tag: "", description: "", alt: "" };

export type CourseRow = {
  id: string;
  slug: string;
  kanji: string;
  image_url: string | null;
  position: number;
  is_active: boolean;
  slots: CourseSlot[];
  translations: Partial<Record<CourseLang, CourseText>>;
};


const COLUMNS = "id, slug, kanji, image_url, position, is_active, slots, translations";

const normalizeRow = (r: CourseRow): CourseRow => ({
  ...r,
  slots: Array.isArray(r.slots) ? r.slots : [],
  translations: r.translations && typeof r.translations === "object" ? r.translations : {},
});

/** Site public : cours actifs uniquement */
export async function fetchCourses(): Promise<CourseRow[]> {
  const { data, error } = await supabase.from("courses").select(COLUMNS).eq("is_active", true).order("position");
  if (error) throw error;
  return ((data ?? []) as CourseRow[]).map(normalizeRow);
}

/** Back-office : tout, y compris les cours masqués */
export async function fetchAllCourses(): Promise<CourseRow[]> {
  const { data, error } = await supabase.from("courses").select(COLUMNS).order("position");
  if (error) throw error;
  return ((data ?? []) as CourseRow[]).map(normalizeRow);
}

/** Enregistre toute la liste : supprime les cours retirés, puis upsert avec positions = ordre du tableau */
export async function saveCourses(rows: CourseRow[], deletedIds: string[]): Promise<CourseRow[]> {
  if (deletedIds.length) {
    const { error } = await supabase.from("courses").delete().in("id", deletedIds);
    if (error) throw error;
  }
  const payload = rows.map((r, i) => ({
    id: r.id, slug: r.slug, kanji: r.kanji, image_url: r.image_url,
    position: i, is_active: r.is_active, slots: r.slots, translations: r.translations,
  }));
  const { data, error } = await supabase.from("courses").upsert(payload, { onConflict: "id" }).select(COLUMNS).order("position");
  if (error) throw error;
  return ((data ?? []) as CourseRow[]).map(normalizeRow);
}

export const newId = () => crypto.randomUUID();

export const slugify = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export const langOf = (l: string): CourseLang => (l.toLowerCase().startsWith("en") ? "en" : "fr");

/** Texte dans la langue demandée ; un champ vide retombe sur le français */
export function textOf(row: CourseRow, lang: string): CourseText {
  const l = langOf(lang);
  const pick = (k: keyof CourseText) => row.translations[l]?.[k]?.trim() || row.translations.fr?.[k] || "";
  return { name: pick("name"), audience: pick("audience"), tag: pick("tag"), description: pick("description"), alt: pick("alt") };
}

/** "18:30" → "18h30" (fr) · "20:00" → "20h" (fr) · "18:30" (autres langues) */
export function formatTime(v: string | null, lang: string): string | null {
  if (!v) return null;
  const [h, m = "00"] = v.split(":");
  return langOf(lang) === "fr" ? (m === "00" ? `${Number(h)}h` : `${Number(h)}h${m}`) : `${h}:${m}`;
}

