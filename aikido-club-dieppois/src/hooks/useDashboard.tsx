import { useCallback, useEffect, useMemo, useRef, useState, type DependencyList } from "react";
import { analyticsService, type DashboardStats } from "../services/admin/analyticService.ts";
import { messagesService, type ContactMessage, type ContactMessageCounts } from "../services/messagesService.ts";
import { fetchAllEventsAdmin, isUpcoming, type EventCard } from "../services/eventsService.ts";
import { useWeeklySchedule } from "./useCourses.tsx";

export type LoadState = "loading" | "ready" | "error";

function useAsync<T>(fn: () => Promise<T>, deps: DependencyList, refreshMs = 0) {
  const [data, setData] = useState<T | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const ticket = useRef(0);

  const load = useCallback((silent: boolean) => {
    const mine = ++ticket.current;
    if (!silent) setState("loading");
    fnRef.current()
      .then((d) => { if (mine === ticket.current) { setData(d); setState("ready"); } })
      .catch(() => { if (mine === ticket.current && !silent) setState("error"); });
  }, []);

  useEffect(() => { load(false); }, deps);

  useEffect(() => {
    const onVisible = () => document.visibilityState === "visible" && load(true);
    document.addEventListener("visibilitychange", onVisible);
    const timer = refreshMs ? window.setInterval(() => load(true), refreshMs) : undefined;
    return () => { document.removeEventListener("visibilitychange", onVisible); if (timer) clearInterval(timer); };
  }, [load, refreshMs]);

  return { data, state, reload: useCallback(() => load(false), [load]), refresh: useCallback(() => load(true), [load]) };
}


export function useAnalytics(days: number) {
  return useAsync<DashboardStats>(() => analyticsService.getStats(days), [days], 5 * 60_000);
}

export interface MessagesOverview {
  counts: ContactMessageCounts;
  latest: ContactMessage[];
  last30: number;
}

export function useMessagesOverview() {
  return useAsync<MessagesOverview>(async () => {
    const [counts, latest, last30] = await Promise.all([
      messagesService.counts(),
      messagesService.latest(5),
      messagesService.receivedSince(30),
    ]);
    return { counts, latest, last30 };
  }, [], 60_000);
}

export interface EventsOverview {
  upcoming: EventCard[];
  next: EventCard | null;
  drafts: number;
  published: number;
}

export function useEventsOverview() {
  return useAsync<EventsOverview>(async () => {
    const all = await fetchAllEventsAdmin();
    const published = all.filter((e) => e.status === "published");
    const upcoming = published.filter(isUpcoming).sort((a, b) => a.event_date.localeCompare(b.event_date));
    return { upcoming, next: upcoming[0] ?? null, drafts: all.length - published.length, published: published.length };
  }, []);
}


export function useTodayClasses() {
  const { schedule, state } = useWeeklySchedule();
  const index = (new Date().getDay() + 6) % 7; // lundi = 0
  return useMemo(() => ({ day: schedule[index]?.day ?? "", classes: schedule[index]?.courses ?? [], state }), [schedule, index, state]);
}