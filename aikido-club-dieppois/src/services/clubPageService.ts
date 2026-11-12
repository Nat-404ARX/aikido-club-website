import { supabase } from "../lib/supabase";

export type LocalizedText = {
  fr: string;
  en: string;
};

export type LocalizedContent = {
  fr: string[];
  en: string[];
};

export type AdminClubSection = {
  id: string;
  section_key: string;
  icon: string;
  title: LocalizedText;
  content: LocalizedContent;
  position: number;
  is_active: boolean;
};

export type ReglementAdminData = {
  id: boolean;
  title: LocalizedText;
  description: LocalizedText;
  notice_title: LocalizedText;
  notice_text: LocalizedText;
  last_update: LocalizedText;
};

export type EngagementsAdminData = {
  id: boolean;
  title: LocalizedText;
  description: LocalizedText;
  introduction: LocalizedText;
  conclusion_title: LocalizedText;
  conclusion_text: LocalizedText;
};

type PageTable = "club_reglement" | "club_engagements";
type SectionTable =
  | "club_reglement_sections"
  | "club_engagements_sections";

async function handleSupabaseError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export async function getReglementAdmin() {
  const [infoResult, sectionsResult] = await Promise.all([
    supabase
      .from("club_reglement")
      .select("*")
      .eq("id", true)
      .single(),

    supabase
      .from("club_reglement_sections")
      .select("*")
      .order("position", { ascending: true }),
  ]);

  handleSupabaseError(infoResult.error);
  handleSupabaseError(sectionsResult.error);

  return {
    info: infoResult.data as ReglementAdminData,
    sections: sectionsResult.data as AdminClubSection[],
  };
}

export async function getEngagementsAdmin() {
  const [infoResult, sectionsResult] = await Promise.all([
    supabase
      .from("club_engagements")
      .select("*")
      .eq("id", true)
      .single(),

    supabase
      .from("club_engagements_sections")
      .select("*")
      .order("position", { ascending: true }),
  ]);

  handleSupabaseError(infoResult.error);
  handleSupabaseError(sectionsResult.error);

  return {
    info: infoResult.data as EngagementsAdminData,
    sections: sectionsResult.data as AdminClubSection[],
  };
}

export async function saveReglementInfo(data: ReglementAdminData) {
  const { error } = await supabase
    .from("club_reglement")
    .update({
      title: data.title,
      description: data.description,
      notice_title: data.notice_title,
      notice_text: data.notice_text,
      last_update: data.last_update,
      updated_at: new Date().toISOString(),
    })
    .eq("id", true);

  handleSupabaseError(error);
}

export async function saveEngagementsInfo(data: EngagementsAdminData) {
  const { error } = await supabase
    .from("club_engagements")
    .update({
      title: data.title,
      description: data.description,
      introduction: data.introduction,
      conclusion_title: data.conclusion_title,
      conclusion_text: data.conclusion_text,
      updated_at: new Date().toISOString(),
    })
    .eq("id", true);

  handleSupabaseError(error);
}

export async function saveClubSections(
  table: SectionTable,
  sections: AdminClubSection[],
  deletedIds: string[],
) {

  if (deletedIds.length > 0) {
    const { error } = await supabase
      .from(table)
      .delete()
      .in("id", deletedIds);

    handleSupabaseError(error);
  }


  for (const [index, section] of sections.entries()) {
    const payload = {
      section_key: section.section_key,
      icon: section.icon,
      title: section.title,
      content: section.content,
      position: index,
      is_active: section.is_active,
      updated_at: new Date().toISOString(),
    };

    if (section.id.startsWith("new-")) {
      const { error } = await supabase
        .from(table)
        .insert(payload);

      handleSupabaseError(error);
    } else {
      const { error } = await supabase
        .from(table)
        .update(payload)
        .eq("id", section.id);

      handleSupabaseError(error);
    }
  }
}

export type ClubPageTable = PageTable;
export type ClubSectionTable = SectionTable;
