import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DAYS, DAY_SHORT, fetchCourses, formatTime, textOf, type CourseRow, type DayKey } from "../data/cours.ts";

export type SlotView = {
  id: string;
  day: DayKey;
  start: string | null;     
  from: string | null;       
  to: string | null;         
  time: string | null;       
};

export type CourseView = {
  id: string;
  slug: string;              
  kanji: string;
  image: string | null;
  name: string;
  audience: string;
  tag: string;
  description: string;
  alt: string;
  slots: SlotView[];
};

type State = "loading" | "ready" | "error";

export function useCourses() {
  const { i18n } = useTranslation();
  const [rows, setRows] = useState<CourseRow[]>([]);
  const [state, setState] = useState<State>("loading");

  const reload = useCallback(() => {
    setState("loading");
    fetchCourses().then((r) => { setRows(r); setState("ready"); }).catch(() => setState("error"));
  }, []);
  useEffect(() => { reload(); }, [reload]);

  const courses = useMemo<CourseView[]>(
    () =>
      rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        kanji: r.kanji,
        image: r.image_url,
        ...textOf(r, i18n.language),
        slots: r.slots.map((s) => {
          const from = formatTime(s.start, i18n.language);
          const to = formatTime(s.end, i18n.language);
          return { id: s.id, day: s.day, start: s.start, from, to, time: from && to ? `${from} – ${to}` : from };
        }),
      })),
    [rows, i18n.language],
  );

  return { courses, state, reload };
}

export function useWeeklySchedule() {
  const { t } = useTranslation("translation", { keyPrefix: "cours" });
  const { courses, state, reload } = useCourses();

  const schedule = useMemo(
    () =>
      DAYS.map((day) => ({
        day: t(`days.${day}`),
        short: DAY_SHORT[day],
        courses: courses
          .flatMap((c) =>
            c.slots
              .filter((s) => s.day === day)
              .map((s) => ({
                id: `${c.id}-${s.id}`,
                name: c.name,
                audience: c.audience,
                detail: c.description,
                start: s.start ?? "99:99",
                time: s.from && s.to ? `${t("from")} ${s.from} ${t("to")} ${s.to}` : (s.from ?? t("tba")),
              })),
          )
          .sort((a, b) => a.start.localeCompare(b.start)),
      })),
    [courses, t],
  );

  return { schedule, state, reload };
}