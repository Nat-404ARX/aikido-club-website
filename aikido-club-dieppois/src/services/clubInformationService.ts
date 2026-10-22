
import { supabase } from "../lib/supabase";

export interface ClubInformation {
  id: boolean;
  email: string;
  phone: string;
  phone_href: string;
  facebook: string;
  youtube: string;
  whatsapp: string;
  instagram: string;
  address: string[];
  maps_url: string;
  mini_maps_url: string;
  season: string;
  annual_schedule_image: string;
  annual_schedule_pdf: string;
  updated_at: string;
}

export type ClubInformationInput = Omit<
  ClubInformation,
  "id" | "updated_at"
>;

export const defaultClubInformation: ClubInformationInput = {
  email: "aikidodieppe@gmail.com",
  phone: "06 60 40 44 22",
  phone_href: "+33660404422",
  facebook: "https://www.facebook.com/aikidodieppe",
  youtube: "https://www.youtube.com/@aikidoclubdieppois",
  whatsapp: "Sur Invitation",
  instagram: "https://www.instagram.com/aikidoclubdieppois/",
  address: [
    "gymnase Dumas",
    "22 Rue Jacques Prévert",
    "76370 Dieppe, France",
  ],
  maps_url:
    "https://www.google.com/maps/place/aikido+club+dieppe/@49.9184157,1.09986,17z/data=!3m1!4b1!4m6!3m5!1s0x47e0a39dac39b42d:0x8ffed2d8df3e17f3!8m2!3d49.9184157!4d1.1024403!16s%2Fg%2F11gk5nbyy7?hl=fr-FR&entry=ttu&g_ep=EgoyMDI2MTAxOC4wIKXMDSoASAFQAw%3D%3D",
  mini_maps_url:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2568.9552014728524!2d1.1024403!3d49.9184157!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e0a39dac39b42d%3A0x8ffed2d8df3e17f3!2saikido club dieppe!5e0!3m2!1sfr!2sfr!4v1792668787986!5m2!1sfr!2sfr",
  season: "2026-2027",
  annual_schedule_image: "/assets/images/horaires/planning-annuel.jpg",
  annual_schedule_pdf: "",
};

const DOCUMENT_BUCKET = "club-documents";
const MAX_PDF_SIZE = 10 * 1024 * 1024;

export const clubInformationService = {
  async get(): Promise<ClubInformationInput> {
    const { data, error } = await supabase
      .from("club_information")
      .select("*")
      .eq("id", true)
      .maybeSingle();

    if (error) {
      throw new Error(
        `Impossible de charger les informations du club : ${error.message}`
      );
    }

    if (!data) return { ...defaultClubInformation };

    return {
      email: data.email ?? "",
      phone: data.phone ?? "",
      phone_href: data.phone_href ?? "",
      facebook: data.facebook ?? "",
      youtube: data.youtube ?? "",
      whatsapp: data.whatsapp ?? "",
      instagram: data.instagram ?? "",
      address: data.address ?? [],
      maps_url: data.maps_url ?? "",
      mini_maps_url: data.mini_maps_url ?? "",
      season: data.season ?? "",
      annual_schedule_image: data.annual_schedule_image ?? "",
      annual_schedule_pdf: data.annual_schedule_pdf ?? "",
    };
  },

  async save(input: ClubInformationInput): Promise<void> {
    const { error } = await supabase
      .from("club_information")
      .upsert(
        {
          id: true,
          ...input,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (error) {
      throw new Error(
        `Impossible d'enregistrer les informations : ${error.message}`
      );
    }
  },

  async uploadPdf(file: File): Promise<string> {
    if (file.type !== "application/pdf") {
      throw new Error("Le document doit être au format PDF.");
    }

    if (file.size <= 0 || file.size > MAX_PDF_SIZE) {
      throw new Error("Le PDF doit peser moins de 10 Mo.");
    }

    const path = `planning/${crypto.randomUUID()}.pdf`;

    const { data, error } = await supabase.storage
      .from(DOCUMENT_BUCKET)
      .upload(path, file, {
        contentType: "application/pdf",
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(`Impossible d'envoyer le PDF : ${error.message}`);
    }

    return supabase.storage
      .from(DOCUMENT_BUCKET)
      .getPublicUrl(data.path).data.publicUrl;
  },

  async deletePdf(url: string): Promise<void> {
    const marker = `/storage/v1/object/public/${DOCUMENT_BUCKET}/`;
    const index = url.indexOf(marker);

    if (index === -1) {
      throw new Error(
        "Ce document ne provient pas du stockage des documents du club."
      );
    }

    const path = decodeURIComponent(url.slice(index + marker.length));

    const { error } = await supabase.storage
      .from(DOCUMENT_BUCKET)
      .remove([path]);

    if (error) {
      throw new Error(`Impossible de supprimer le PDF : ${error.message}`);
    }
  },
};
