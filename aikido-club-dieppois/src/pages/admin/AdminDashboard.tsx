import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, CalendarDays, CalendarPlus, Check, Clock3, ContactRound, ExternalLink, Eye, Landmark,
  Mail, Monitor, RefreshCw, Smartphone, Tablet, TrendingDown, TrendingUp, Users, type LucideIcon,
} from "lucide-react";
import { useAnalytics, useEventsOverview, useMessagesOverview, useTodayClasses } from "../../hooks/useDashboard.tsx";
import { messagesService } from "../../services/messagesService.ts";
import { formatEventDate } from "../../services/eventsService.ts";
import type { DashboardStats, DeviceType, SourceType } from "../../services/admin/analyticService.ts";


const QUICK_LINKS: { to: string; title: string; text: string; icon: LucideIcon; external?: boolean; badge?: "messages" }[] = [
  { to: "/admin/messages", title: "Messages", text: "Lire les demandes de contact et d'inscription.", icon: Mail, badge: "messages" },
  { to: "/admin/evenements", title: "Évènements", text: "Créer et modifier les stages, passages de grade…", icon: CalendarPlus },
  { to: "/admin/pages/cours", title: "Cours et horaires", text: "Modifier les cours et le planning de la semaine.", icon: CalendarDays },
  { to: "/admin/pages/club", title: "Page du club", text: "Raconter l'histoire et les valeurs du club.", icon: Landmark },
  { to: "/admin/pages/informations-club", title: "Informations du club", text: "Coordonnées, réseaux sociaux, adresse du dojo.", icon: ContactRound },
  { to: "/", title: "Voir le site", text: "Ouvrir le site public dans un nouvel onglet.", icon: ExternalLink, external: true },
];


const PAGE_LABELS: Record<string, string> = {
  "/": "Accueil", "/cours": "Les cours", "/horaires": "Horaires & tarifs", "/aikido": "L'aïkido",
  "/club": "Le club", "/evenements": "Évènements", "/contact": "Contact",
};
const pageLabel = (path: string) =>
  PAGE_LABELS[path] ?? (path.startsWith("/evenements/") ? `Évènement : ${path.slice(12)}` : path);

const SOURCE_LABELS: Record<SourceType, string> = {
  search: "Moteurs de recherche", social: "Réseaux sociaux", direct: "Accès direct", site: "Autres sites", campaign: "QR codes & campagnes",
};
const SOURCE_COLORS: Record<SourceType, string> = {
  search: "bg-neutral-900", social: "bg-neutral-600", direct: "bg-neutral-400", site: "bg-neutral-300", campaign: "bg-sky-600",
};
const DEVICE_LABELS: Record<DeviceType, { label: string; icon: LucideIcon }> = {
  mobile: { label: "Téléphone", icon: Smartphone }, tablet: { label: "Tablette", icon: Tablet }, desktop: { label: "Ordinateur", icon: Monitor },
};


const nf = new Intl.NumberFormat("fr-FR");
const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });

function relativeTime(iso: string) {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const abs = Math.abs(diff);
  if (abs < 60) return "à l'instant";
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86_400) return rtf.format(Math.round(diff / 3600), "hour");
  if (abs < 30 * 86_400) return rtf.format(Math.round(diff / 86_400), "day");
  return new Date(iso).toLocaleDateString("fr-FR");
}


function Panel({ title, hint, action, children }: { title: string; hint?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="min-w-0 rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
          {hint && <p className="mt-0.5 text-sm text-neutral-500">{hint}</p>}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Trend({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return current > 0 ? <span className="text-xs font-medium text-neutral-500">nouveau</span> : null;
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return <span className="text-xs font-medium text-neutral-500">stable</span>;
  const up = pct > 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${up ? "text-emerald-600" : "text-red-600"}`}>
      <Icon className="size-3.5" aria-hidden />{up ? "+" : ""}{pct} %
    </span>
  );
}

function Kpi({ label, value, hint, icon: Icon, trend, to, highlight }: {
  label: string; value: number | null; hint?: ReactNode; icon: LucideIcon; trend?: ReactNode; to?: string; highlight?: boolean;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${highlight ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-700"}`}>
          <Icon aria-hidden className="size-5" />
        </div>
        {trend}
      </div>
      <p className="mt-5 text-sm text-neutral-500">{label}</p>
      {value === null ? (
        <div className="mt-1 h-9 w-20 animate-pulse rounded bg-neutral-100" />
      ) : (
        <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-neutral-900">{nf.format(value)}</p>
      )}
      {hint && <p className="mt-1.5 text-xs text-neutral-500">{hint}</p>}
    </>
  );
  const cls = "block min-w-0 rounded-xl border border-neutral-200 bg-white p-5";
  return to ? <Link to={to} className={`${cls} transition hover:border-neutral-400 hover:shadow-sm`}>{body}</Link> : <div className={cls}>{body}</div>;
}

function HBar({ label, value, max, sub }: { label: ReactNode; value: number; max: number; sub?: string }) {
  return (
    <li>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="min-w-0 truncate text-neutral-800">{label}</span>
        <span className="shrink-0 tabular-nums text-neutral-500">{nf.format(value)}{sub && <span className="ml-1 text-xs">{sub}</span>}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-neutral-100">
        <div className="h-full rounded-full bg-neutral-900" style={{ width: `${max ? Math.max(2, (value / max) * 100) : 0}%` }} />
      </div>
    </li>
  );
}

function Skeleton({ rows = 3 }: { rows?: number }) {
  return <div aria-busy="true" className="space-y-3">{Array.from({ length: rows }, (_, i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-neutral-100" />)}</div>;
}

function ErrorBox({ text, onRetry }: { text: string; onRetry: () => void }) {
  return (
    <p className="rounded-lg bg-neutral-50 p-4 text-sm text-neutral-600">
      {text}{" "}
      <button type="button" onClick={onRetry} className="inline-flex items-center gap-1 font-semibold text-neutral-900 underline">
        <RefreshCw className="size-3.5" aria-hidden />Réessayer
      </button>
    </p>
  );
}


function DailyChart({ daily }: { daily: DashboardStats["daily"] }) {
  const max = Math.max(1, ...daily.map((d) => d.visits));
  const fmt = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  return (
    <div>
      <div role="img" aria-label={`Visites par jour sur ${daily.length} jours`} className="flex h-44 items-end gap-px sm:gap-0.5">
        {daily.map((d) => (
          <div
            key={d.day}
            title={`${fmt(d.day)} : ${d.visits} visite${d.visits > 1 ? "s" : ""}, ${d.views} page${d.views > 1 ? "s" : ""} vue${d.views > 1 ? "s" : ""}`}
            className="flex-1 rounded-t bg-neutral-900 transition-colors hover:bg-sky-600"
            style={{ height: `${Math.max(d.visits ? 3 : 1, (d.visits / max) * 100)}%`, opacity: d.visits ? 1 : 0.15 }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-neutral-500">
        <span>{daily[0] && fmt(daily[0].day)}</span>
        <span>pic : {nf.format(max)} visite{max > 1 ? "s" : ""}/jour</span>
        <span>{daily.at(-1) && fmt(daily.at(-1)!.day)}</span>
      </div>
    </div>
  );
}


export default function AdminDashboard() {
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const analytics = useAnalytics(days);
  const messages = useMessagesOverview();
  const events = useEventsOverview();
  const today = useTodayClasses();
  const [busyId, setBusyId] = useState<string | null>(null);

  const stats = analytics.data;
  const msg = messages.data;
  const newCount = msg?.counts.new ?? 0;

  const markRead = async (id: string) => {
    setBusyId(id);
    try { await messagesService.setStatus(id, "read"); messages.refresh(); } finally { setBusyId(null); }
  };

  const byType = (Object.keys(SOURCE_LABELS) as SourceType[])
    .map((type) => ({ type, visits: stats?.sources.filter((s) => s.source_type === type).reduce((a, s) => a + s.visits, 0) ?? 0 }))
    .filter((s) => s.visits > 0)
    .sort((a, b) => b.visits - a.visits);
  const sourcesTotal = byType.reduce((a, s) => a + s.visits, 0);
  const devicesTotal = stats?.devices.reduce((a, d) => a + d.visits, 0) ?? 0;
  const noData = analytics.state === "ready" && stats && stats.views === 0;

  const hour = new Date().getHours();
  const dateLabel = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

  return (
    <main className="mx-auto max-w-7xl space-y-8 p-6 pb-12">
      {/* ============ EN-TÊTE ============ */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm capitalize text-neutral-500">{dateLabel}</p>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-900">{hour < 18 ? "Bonjour" : "Bonsoir"}</h1>
          <p className="mt-1 text-sm text-neutral-500">Voici l'activité du site en un coup d'œil.</p>
        </div>
        <div role="radiogroup" aria-label="Période des statistiques" className="inline-flex rounded-lg border border-neutral-200 bg-white p-1">
          {([7, 30, 90] as const).map((d) => (
            <button key={d} type="button" role="radio" aria-checked={days === d} onClick={() => setDays(d)}
              className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition ${days === d ? "bg-neutral-900 text-white" : "text-neutral-600 hover:text-neutral-900"}`}>
              {d} jours
            </button>
          ))}
        </div>
      </header>

      {/* ============ ALERTE MESSAGES ============ */}
      {newCount > 0 && (
        <Link to="/admin/messages" className="flex items-center justify-between gap-4 rounded-xl bg-neutral-900 p-4 text-white transition hover:bg-neutral-700 sm:p-5">
          <span className="flex items-center gap-3">
            <Mail className="size-5 shrink-0" aria-hidden />
            <span className="text-sm font-medium sm:text-base">
              {newCount === 1 ? "1 nouveau message vous attend" : `${nf.format(newCount)} nouveaux messages vous attendent`}
            </span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold">Lire<ArrowRight className="size-4" aria-hidden /></span>
        </Link>
      )}

      {/* ============ CHIFFRES CLÉS ============ */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Nouveaux messages" icon={Mail} to="/admin/messages" highlight={newCount > 0}
          value={msg ? newCount : null}
          hint={msg ? `${nf.format(msg.last30)} reçu${msg.last30 > 1 ? "s" : ""} sur 30 jours` : undefined}
        />
        <Kpi
          label={`Visites · ${days} jours`} icon={Users}
          value={stats ? stats.visits : null}
          trend={stats && <Trend current={stats.visits} previous={stats.prev_visits} />}
          hint={stats ? `${nf.format(stats.today_visits)} aujourd'hui` : undefined}
        />
        <Kpi
          label={`Pages vues · ${days} jours`} icon={Eye}
          value={stats ? stats.views : null}
          trend={stats && <Trend current={stats.views} previous={stats.prev_views} />}
          hint={stats && stats.visits ? `${(stats.views / stats.visits).toFixed(1).replace(".", ",")} pages par visite` : undefined}
        />
        <Kpi
          label="Évènements" icon={CalendarDays} to="/admin/evenements"
          value={events.data ? events.data.upcoming.length : null}
          hint={events.data
            ? events.data.next ? `Dernier mis en ligne : ${events.data.next.title}` : "Aucun évènement"
            : undefined}
        />
      </div>

      {/* ============ ACCÈS RAPIDE ============ */}
      <section aria-labelledby="quick-title">
        <h2 id="quick-title" className="mb-4 text-base font-semibold text-neutral-900">Accès rapide</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {QUICK_LINKS.map(({ to, title, text, icon: Icon, external, badge }) => {
            const count = badge === "messages" ? newCount : 0;
            const inner = (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex size-11 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
                    <Icon aria-hidden className="size-5" />
                  </div>
                  <span className="flex items-center gap-3">
                    {count > 0 && <span className="rounded-full bg-neutral-900 px-2.5 py-0.5 text-xs font-semibold text-white">{count} nouveau{count > 1 ? "x" : ""}</span>}
                    <ArrowRight aria-hidden className="size-5 text-neutral-400 transition group-hover:translate-x-1 group-hover:text-neutral-900" />
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-neutral-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">{text}</p>
              </>
            );
            const cls = "group rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-400 hover:shadow-sm";
            return external
              ? <a key={to} href={to} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
              : <Link key={to} to={to} className={cls}>{inner}</Link>;
          })}
        </div>
      </section>

      {/* ============ MESSAGES + AUJOURD'HUI ============ */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Panel
            title="Derniers messages"
            hint="Demandes de contact et d'inscription reçues via le site."
            action={<Link to="/admin/messages" className="shrink-0 text-sm font-semibold text-neutral-900 underline">Tout voir</Link>}
          >
            {messages.state === "loading" && !msg && <Skeleton />}
            {messages.state === "error" && !msg && <ErrorBox text="Impossible de charger les messages." onRetry={messages.reload} />}
            {msg && msg.latest.length === 0 && <p className="py-6 text-center text-sm text-neutral-500">Aucun message pour l'instant.</p>}
            {msg && msg.latest.length > 0 && (
              <ul className="divide-y divide-neutral-200">
                {msg.latest.map((m) => (
                  <li key={m.id} className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
                    <span aria-label={m.status === "new" ? "Nouveau" : "Lu"} className={`mt-2 size-2 shrink-0 rounded-full ${m.status === "new" ? "bg-sky-600" : "bg-neutral-300"}`} />
                    <Link to="/admin/messages" className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className={`truncate text-sm ${m.status === "new" ? "font-semibold text-neutral-900" : "font-medium text-neutral-700"}`}>{m.name}</span>
                        <span className="shrink-0 text-xs text-neutral-400">{relativeTime(m.created_at)}</span>
                      </span>
                      <span className="mt-0.5 block line-clamp-2 break-words text-sm text-neutral-500">{m.message}</span>
                    </Link>
                    {m.status === "new" && (
                      <button type="button" onClick={() => markRead(m.id)} disabled={busyId === m.id} aria-label={`Marquer le message de ${m.name} comme lu`} title="Marquer comme lu"
                        className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition hover:border-neutral-900 hover:text-neutral-900 disabled:opacity-40">
                        <Check className="size-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Panel title="Aujourd'hui au dojo" hint={today.day}>
            {today.state === "loading" && <Skeleton rows={2} />}
            {today.state === "error" && <p className="text-sm text-neutral-500">Horaires indisponibles.</p>}
            {today.state === "ready" && today.classes.length === 0 && <p className="py-2 text-sm text-neutral-500">Pas de cours aujourd'hui.</p>}
            {today.state === "ready" && today.classes.length > 0 && (
              <ul className="space-y-3">
                {today.classes.map((c) => (
                  <li key={c.id} className="flex items-start gap-3">
                    <Clock3 className="mt-0.5 size-4 shrink-0 text-neutral-400" aria-hidden />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-900">{c.name}</p>
                      <p className="text-xs text-neutral-500">{c.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Évènements" action={<Link to="/admin/evenements" className="shrink-0 text-sm font-semibold text-neutral-900 underline">Gérer</Link>}>
            {events.state === "loading" && !events.data && <Skeleton rows={2} />}
            {events.state === "error" && !events.data && <ErrorBox text="Impossible de charger les évènements." onRetry={events.reload} />}
            {events.data && (
              <div className="space-y-4 text-sm">
                {events.data.next ? (
                  <div className="rounded-lg bg-neutral-50 p-3">
                    <p className="text-xs text-neutral-500">Les évènements</p>
                    <p className="mt-1 font-semibold text-neutral-900">{events.data.next.title}</p>
                    <p className="text-neutral-500">{formatEventDate(events.data.next.event_date, events.data.next.end_date, "fr")}</p>
                  </div>
                ) : <p className="text-neutral-500">Aucun évènement</p>}
                <p className="text-neutral-500">
                  {events.data.published} publié{events.data.published > 1 ? "s" : ""}
                  {events.data.drafts > 0 && <> · <span className="font-medium text-neutral-800">{events.data.drafts} brouillon{events.data.drafts > 1 ? "s" : ""}</span></>}
                </p>
              </div>
            )}
          </Panel>
        </div>
      </div>

      {/* ============ FRÉQUENTATION ============ */}
      <Panel
        title="Visites du site"
        hint={`Nombre de visites par jour sur les ${days} derniers jours (les visites des administrateurs ne sont pas comptées).`}
      >
        {analytics.state === "loading" && !stats && <div className="h-44 animate-pulse rounded-lg bg-neutral-100" />}
        {analytics.state === "error" && !stats && (
          <ErrorBox text="Statistiques indisponibles. Les scripts SQL « analytics.sql » ont-ils été exécutés ?" onRetry={analytics.reload} />
        )}
        {noData && (
          <p className="rounded-lg bg-neutral-50 p-4 text-sm text-neutral-600">
            Aucune visite enregistrée sur cette période.
          </p>
        )}
        {stats && !noData && <DailyChart daily={stats.daily} />}
      </Panel>

      {stats && !noData && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="D'où viennent les visiteurs ?" hint="Première page de chaque visite.">
            {byType.length === 0 ? <p className="text-sm text-neutral-500">Pas encore de données.</p> : (
              <>
                <div className="flex h-3 overflow-hidden rounded-full bg-neutral-100" role="img" aria-label="Répartition des provenances">
                  {byType.map((s) => <div key={s.type} className={SOURCE_COLORS[s.type]} style={{ width: `${(s.visits / sourcesTotal) * 100}%` }} title={SOURCE_LABELS[s.type]} />)}
                </div>
                <ul className="mt-4 space-y-2">
                  {byType.map((s) => (
                    <li key={s.type} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex min-w-0 items-center gap-2"><span className={`size-2.5 shrink-0 rounded-full ${SOURCE_COLORS[s.type]}`} /><span className="truncate text-neutral-800">{SOURCE_LABELS[s.type]}</span></span>
                      <span className="shrink-0 tabular-nums text-neutral-500">{Math.round((s.visits / sourcesTotal) * 100)} %</span>
                    </li>
                  ))}
                </ul>
                <h3 className="mb-3 mt-6 text-sm font-semibold text-neutral-900">Détail</h3>
                <ul className="space-y-3">
                  {stats.sources.slice(0, 6).map((s) => <HBar key={`${s.source_type}-${s.source_name}`} label={s.source_type === "direct" ? "Accès direct" : s.source_name} value={s.visits} max={stats.sources[0].visits} />)}
                </ul>
              </>
            )}
          </Panel>

          <Panel title="Pages les plus vues">
            {stats.top_pages.length === 0 ? <p className="text-sm text-neutral-500">Pas encore de données.</p> : (
              <ul className="space-y-4">
                {stats.top_pages.map((p) => <HBar key={p.path} label={pageLabel(p.path)} value={p.views} max={stats.top_pages[0].views} sub="vues" />)}
              </ul>
            )}
          </Panel>

          <div className="space-y-6">
            <Panel title="Appareils">
              <ul className="space-y-3">
                {stats.devices.map((d) => {
                  const { label, icon: Icon } = DEVICE_LABELS[d.device];
                  return (
                    <li key={d.device} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-2.5 text-neutral-800"><Icon className="size-4 text-neutral-400" aria-hidden />{label}</span>
                      <span className="tabular-nums text-neutral-500">{devicesTotal ? Math.round((d.visits / devicesTotal) * 100) : 0} %</span>
                    </li>
                  );
                })}
              </ul>
            </Panel>

            <Panel title="QR codes & flyers" hint="Mesurez l'effet de vos affiches.">
              {stats.campaigns.length > 0 ? (
                <ul className="space-y-3">
                  {stats.campaigns.map((c) => <HBar key={c.name} label={c.name} value={c.visits} max={stats.campaigns[0].visits} sub="visites" />)}
                </ul>
              ) : (
                <p className="text-sm leading-relaxed text-neutral-500">
                  Ajoutez <code className="rounded bg-neutral-100 px-1 text-neutral-800">?utm_source=flyer</code> à l'adresse imprimée sur vos affiches ou QR codes
                  (ex. <code className="rounded bg-neutral-100 px-1 text-neutral-800">votre-site.fr/?utm_source=forum-asso</code>) : les visites apparaîtront ici.
                </p>
              )}
            </Panel>
          </div>
        </div>
      )}
    </main>
  );
}