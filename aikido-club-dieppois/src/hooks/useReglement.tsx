import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase.ts";

type LocalizedText = {
  fr: string;
  en: string;
};

type LocalizedContent = {
  fr: string[];
  en: string[];
};

export type ReglementSection = {
  id: string;
  sectionKey: string;
  icon: string;
  title: string;
  content: string[];
  position: number;
};

export type ReglementInfo = {
  title: string;
  description: string;
  noticeTitle: string;
  noticeText: string;
  lastUpdate: string;
};

type ReglementRow = {
  id: boolean;
  title: LocalizedText;
  description: LocalizedText;
  notice_title: LocalizedText;
  notice_text: LocalizedText;
  last_update: LocalizedText;
};

type ReglementSectionRow = {
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

export function useReglement() {
  const { i18n } = useTranslation();

  const language = i18n.resolvedLanguage?.startsWith("en")
    ? "en"
    : "fr";

  const [reglement, setReglement] = useState<ReglementInfo | null>(null);
  const [sections, setSections] = useState<ReglementSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReglement = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [pageResult, sectionsResult] = await Promise.all([
        supabase
          .from("club_reglement")
          .select("*")
          .eq("id", true)
          .single(),

        supabase
          .from("club_reglement_sections")
          .select("*")
          .eq("is_active", true)
          .order("position", { ascending: true }),
      ]);

      if (pageResult.error) throw pageResult.error;
      if (sectionsResult.error) throw sectionsResult.error;

      const page = pageResult.data as ReglementRow;
      const sectionRows = sectionsResult.data as ReglementSectionRow[];

      setReglement({
        title: getLocalizedText(page.title, language),
        description: getLocalizedText(page.description, language),
        noticeTitle: getLocalizedText(page.notice_title, language),
        noticeText: getLocalizedText(page.notice_text, language),
        lastUpdate: getLocalizedText(page.last_update, language),
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
          : "Impossible de charger le règlement intérieur."
      );
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    void fetchReglement();
  }, [fetchReglement]);

  return {
    reglement,
    sections,
    loading,
    error,
    refresh: fetchReglement,
  };
}
