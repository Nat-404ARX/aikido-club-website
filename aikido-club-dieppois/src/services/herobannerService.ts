import { supabase } from "../lib/supabase";


export interface HeroBannerData {
  eyebrow: string;
  title: string;
  description: string;
  image_url: string | null;
  button_label: string;
  button_href: string;
  is_enabled: boolean;
}


export const defaultHeroBanner: HeroBannerData = {
  eyebrow: "À la une",
  title: "Bienvenue à l'Aïkido Club Dieppois",
  description: "",
  image_url: null,
  button_label: "Découvrir",
  button_href: "/evenements",
  is_enabled: false,
};


export async function getHeroBanner(): Promise<HeroBannerData> {
  const { data, error } = await supabase
    .from("hero_banner")
    .select(
      "eyebrow, title, description, image_url, button_label, button_href, is_enabled"
    )
    .eq("id", "home")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return defaultHeroBanner;
  }

  return {
    ...defaultHeroBanner,
    ...data,
  };
}

export async function saveHeroBanner(
  banner: HeroBannerData
): Promise<void> {
  const { error } = await supabase
    .from("hero_banner")
    .upsert(
      {
        id: "home",
        ...banner,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "id",
      }
    );

  if (error) {
    throw error;
  }
}
