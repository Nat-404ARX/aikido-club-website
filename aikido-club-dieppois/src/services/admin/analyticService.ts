import { supabase } from "../../lib/supabase";

export type SourceType = "direct" | "search" | "social" | "site" | "campaign";
export type DeviceType = "mobile" | "tablet" | "desktop";

export interface DashboardStats {
  visits: number;
  views: number;
  prev_visits: number;
  prev_views: number;
  today_visits: number;
  daily: { day: string; visits: number; views: number }[];
  top_pages: { path: string; views: number; visits: number }[];
  sources: { source_type: SourceType; source_name: string; visits: number }[];
  devices: { device: DeviceType; visits: number }[];
  campaigns: { name: string; visits: number }[];
}

const SESSION_KEY = "club:visit";
let memorySession: string | null = null;
let entrySent = false;
let lastPath = "";

function visitId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) { id = crypto.randomUUID(); sessionStorage.setItem(SESSION_KEY, id); }
    return id;
  } catch {
    return (memorySession ??= crypto.randomUUID());
  }
}

const SEARCH_ENGINES = ["google", "bing", "duckduckgo", "ecosia", "qwant", "yahoo", "brave", "startpage"];
const SOCIALS: Record<string, string> = {
  facebook: "Facebook", "fb.com": "Facebook", instagram: "Instagram", "t.co": "X (Twitter)", twitter: "X (Twitter)",
  "x.com": "X (Twitter)", linkedin: "LinkedIn", "lnkd.in": "LinkedIn", youtube: "YouTube", tiktok: "TikTok",
  pinterest: "Pinterest", whatsapp: "WhatsApp", reddit: "Reddit",
};

function classifySource(): { type: SourceType; name: string; campaign: string | null } {
  const params = new URLSearchParams(window.location.search);
  const utm = params.get("utm_source");
  const campaign = params.get("utm_campaign");
  if (utm) return { type: "campaign", name: utm.slice(0, 100), campaign: campaign?.slice(0, 100) ?? null };

  if (!document.referrer) return { type: "direct", name: "direct", campaign: null };
  let host = "";
  try { host = new URL(document.referrer).hostname.replace(/^www\./, ""); } catch { /* référent invalide */ }
  if (!host || host === window.location.hostname.replace(/^www\./, "")) return { type: "direct", name: "direct", campaign: null };

  const engine = SEARCH_ENGINES.find((e) => host.includes(e));
  if (engine) return { type: "search", name: engine[0].toUpperCase() + engine.slice(1), campaign: null };
  const social = Object.keys(SOCIALS).find((k) => host.includes(k));
  if (social) return { type: "social", name: SOCIALS[social], campaign: null };
  return { type: "site", name: host.slice(0, 100), campaign: null };
}

function deviceType(): DeviceType {
  const w = window.innerWidth;
  return w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop";
}

async function shouldTrack(path: string): Promise<boolean> {
  if (path.startsWith("/admin")) return false;
  if (["localhost", "127.0.0.1"].includes(window.location.hostname)) return false;
  if (navigator.doNotTrack === "1" || navigator.webdriver) return false;
  if (/bot|crawl|spider|headless|lighthouse|preview/i.test(navigator.userAgent)) return false;
  const { data } = await supabase.auth.getSession();
  return !data.session;
}

export const analyticsService = {
  async trackPageView(path: string): Promise<void> {
    try {
      if (path === lastPath || !(await shouldTrack(path))) return;
      lastPath = path;

      const first = !entrySent;
      entrySent = true;
      const src = first ? classifySource() : null;

      await supabase.rpc("track_page_view", {
        p_session: visitId(),
        p_path: path,
        p_source_type: src?.type ?? null,
        p_source_name: src?.name ?? null,
        p_campaign: src?.campaign ?? null,
        p_device: deviceType(),
      });
    } catch {
    }
  },

  async getStats(days: number): Promise<DashboardStats> {
    const { data, error } = await supabase.rpc("dashboard_stats", { p_days: days });
    if (error) throw new Error("Impossible de charger les statistiques.");
    return data as DashboardStats;
  },
};