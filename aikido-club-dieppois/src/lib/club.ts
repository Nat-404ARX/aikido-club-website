import { supabase } from "./supabase.ts"; 

export type ClubImage = { id: string; url: string; alt: string };
type Base = { id: string };
export type TextBlock = Base & { type: "text"; subtitle: string; body: string };
export type ImagesBlock = Base & { type: "images"; images: ClubImage[]; caption: string };
export type TimelineItem = { id: string; year: string; title: string; text: string };
export type TimelineBlock = Base & { type: "timeline"; items: TimelineItem[] };
export type StatItem = { id: string; value: string; label: string };
export type StatsBlock = Base & { type: "stats"; items: StatItem[] };
export type QuoteBlock = Base & { type: "quote"; text: string; author: string };
export type ClubBlock = TextBlock | ImagesBlock | TimelineBlock | StatsBlock | QuoteBlock;
export type BlockType = ClubBlock["type"];

export type ClubSection = {
  id: string;
  slug: string;      // ancre + entrée de la navigation secondaire
  navLabel: string;  // texte dans la navigation secondaire
  kanji: string;     // décor (1 ou 2 caractères)
  title: string;
  subtitle: string;
  blocks: ClubBlock[];
};

export type ClubPage = {
  hero_image_url: string | null;
  hero_image_alt: string;
  sections: ClubSection[];
};

export const EMPTY_CLUB: ClubPage = { hero_image_url: null, hero_image_alt: "", sections: [] };

export const BLOCK_LABELS: Record<BlockType, string> = {
  text: "Texte",
  images: "Images",
  timeline: "Chronologie",
  stats: "Chiffres clés",
  quote: "Citation",
};


const COLUMNS = "hero_image_url, hero_image_alt, sections";

export async function fetchClubPage(): Promise<ClubPage> {
  const { data, error } = await supabase.from("club_page").select(COLUMNS).eq("id", "main").maybeSingle();
  if (error) throw error;
  if (!data) return EMPTY_CLUB;
  return {
    hero_image_url: data.hero_image_url ?? null,
    hero_image_alt: data.hero_image_alt ?? "",
    sections: Array.isArray(data.sections) ? (data.sections as ClubSection[]) : [],
  };
}

export async function saveClubPage(page: ClubPage): Promise<ClubPage> {
  const { data, error } = await supabase
    .from("club_page")
    .upsert({ id: "main", hero_image_url: page.hero_image_url, hero_image_alt: page.hero_image_alt, sections: page.sections })
    .select(COLUMNS)
    .single();
  if (error) throw error;
  return { hero_image_url: data.hero_image_url ?? null, hero_image_alt: data.hero_image_alt ?? "", sections: data.sections as ClubSection[] };
}

export const newId = () => crypto.randomUUID();

export const slugify = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export function newBlock(type: BlockType): ClubBlock {
  const id = newId();
  switch (type) {
    case "text": return { id, type, subtitle: "", body: "" };
    case "images": return { id, type, images: [], caption: "" };
    case "timeline": return { id, type, items: [{ id: newId(), year: "", title: "", text: "" }] };
    case "stats": return { id, type, items: [{ id: newId(), value: "", label: "" }] };
    case "quote": return { id, type, text: "", author: "" };
  }
}

export const newSection = (): ClubSection => ({
  id: newId(), slug: "", navLabel: "", kanji: "", title: "", subtitle: "", blocks: [newBlock("text")],
});