import { supabase } from "../lib/supabase";

export type HeroBannerData = {
  eyebrow: string;
  title: string;
  description: string;
  image_url: string;
  button_label: string;
  button_href: string;
};

export const defaultHeroBanner: HeroBannerData = {
  eyebrow: "À LA UNE",
  title: "Le prochain rendez-vous du club",
  description:
    "Retrouvez toutes les informations sur notre prochain événement.",
  image_url: "",
  button_label: "Découvrir l’événement",
  button_href: "/evenements",
};

export async function getHeroBanner(): Promise<HeroBannerData> {
  const { data, error } = await supabase
    .from("homepage_hero_banner")
    .select(
      "eyebrow, title, description, image_url, button_label, button_href",
    )
    .eq("id", true)
    .maybeSingle();

  if (error) throw error;

  return data ?? defaultHeroBanner;
}

export async function saveHeroBanner(
  banner: HeroBannerData,
): Promise<void> {
  const { error } = await supabase
    .from("homepage_hero_banner")
    .upsert({ id: true, ...banner, updated_at: new Date().toISOString() });

  if (error) throw error;
}
