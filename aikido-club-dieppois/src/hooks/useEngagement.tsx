import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase";

type LocalizedText = {
  fr: string;
  en: string;
};

type LocalizedContent = {
  fr: string[];
  en: string[];
};

export type EngagementSection = {
  id: string;
  sectionKey: string;
  icon: string;
  title: string;
  content: string[];
  position: number;
};

export type EngagementInfo = {
  title: string;
  description: string;
  introduction: string;
  conclusionTitle: string;
  conclusionText: string;
};

type EngagementRow = {
  id: boolean;
  title: LocalizedText;
  description: LocalizedText;
  introduction: LocalizedText;
  conclusion_title: LocalizedText;
  conclusion_text: LocalizedText;
};

type EngagementSectionRow = {
  id: string;
  section_key: string;
  icon: string;
  title: LocalizedText;
  content: LocalizedContent;
  position: number;
  is_active: boolean;
};

function getLocalizedText(
  value: LocalizedText | null | undefined,
  language: string
): string {
  if (!value) return "";

  return value[language as keyof LocalizedText] ?? value.fr ?? "";
}

function getLocalizedContent(
  value: LocalizedContent | null | undefined,
  language: string
): string[] {
  if (!value) return [];

  return value[language as keyof LocalizedContent] ?? value.fr ?? [];
}

export function useEngagements() {
  const { i18n } = useTranslation();

  const language = i18n.resolvedLanguage?.startsWith("en")
    ? "en"
    : "fr";

  const [engagements, setEngagements] =
    useState<EngagementInfo | null>(null);

  const [sections, setSections] = useState<EngagementSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEngagements = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [pageResult, sectionsResult] = await Promise.all([
        supabase
          .from("club_engagements")
          .select("*")
          .eq("id", true)
          .single(),

        supabase
          .from("club_engagements_sections")
          .select("*")
          .eq("is_active", true)
          .order("position", { ascending: true }),
      ]);

      if (pageResult.error) throw pageResult.error;
      if (sectionsResult.error) throw sectionsResult.error;

      const page = pageResult.data as EngagementRow;
      const sectionRows =
        sectionsResult.data as EngagementSectionRow[];

      setEngagements({
        title: getLocalizedText(page.title, language),
        description: getLocalizedText(page.description, language),
        introduction: getLocalizedText(page.introduction, language),
        conclusionTitle: getLocalizedText(
          page.conclusion_title,
          language
        ),
        conclusionText: getLocalizedText(
          page.conclusion_text,
          language
        ),
      });

      setSections(
        sectionRows.map((section) => ({
          id: section.id,
          sectionKey: section.section_key,
          icon: section.icon,
          title: getLocalizedText(section.title, language),
          content: getLocalizedContent(section.content, language),
          position: section.position,
        }))
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les engagements du club."
      );
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    void fetchEngagements();
  }, [fetchEngagements]);

  return {
    engagements,
    sections,
    loading,
    error,
    refresh: fetchEngagements,
  };
}
