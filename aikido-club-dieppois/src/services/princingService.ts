import { supabase } from "../lib/supabase";

export type PricingPlan = {
  key: "adult" | "child";
  price: number | null;
  description: string;
};

export type PricingData = {
  season: string;
  pdf_url: string;
  plans: PricingPlan[];
};

export const defaultPricing: PricingData = {
  season: "2026-2027",
  pdf_url: "/documents/tarifs/tarifs2026-2027.pdf",
  plans: [
    { key: "adult", price: 175, description: "" },
    { key: "child", price: 115, description: "" },
  ],
};

export const pricingService = {
  async get(): Promise<PricingData> {
    const { data, error } = await supabase
      .from("club_pricing")
      .select("season, pdf_url, plans")
      .eq("id", true)
      .maybeSingle();

    if (error) throw error;
    if (!data) return defaultPricing;

    const plans = Array.isArray(data.plans) ? data.plans : [];

    return {
      season: data.season || defaultPricing.season,
      pdf_url: data.pdf_url ?? defaultPricing.pdf_url,
      plans: plans.length
        ? plans as PricingPlan[]
        : defaultPricing.plans,
    };
  },

  async save(input: PricingData): Promise<void> {
    const { error } = await supabase
      .from("club_pricing")
      .upsert(
        {
          id: true,
          season: input.season,
          pdf_url: input.pdf_url,
          plans: input.plans,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (error) throw error;
  },

  async uploadPdf(file: File): Promise<string> {
    if (file.type !== "application/pdf") {
      throw new Error("Le fichier doit être un PDF.");
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error("Le PDF ne doit pas dépasser 10 Mo.");
    }

    const path = `tarifs/${crypto.randomUUID()}.pdf`;

    const { error } = await supabase.storage
      .from("club-documents")
      .upload(path, file, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from("club-documents")
      .getPublicUrl(path);

    return data.publicUrl;
  },
};
