import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Eye, ImagePlus, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import MediaPicker from "../../components/admin/MediaPicker.tsx";
import {
  EVENT_CATEGORIES, deleteEvent, fetchAllEventsAdmin, fetchEventById, planLayout, saveEvent, slugify,
  type EventCard, type EventDraft, type EventRow,
} from "../../services/eventsService.ts";

/* ------------------------------------------------------------------ */
/*  Adaptateur MediaPicker                                             */
/*  Hypothèse : <MediaPicker open multiple onClose onSelect />         */
/*  onSelect reçoit une URL, un objet { url } ou un tableau des deux.  */
/*  Si ton API diffère, ne modifie que ce bloc et <MediaPicker …/>.    */
/* ------------------------------------------------------------------ */
type PickResult = { url?: string; publicUrl?: string; src?: string };
function toUrls(result: unknown): string[] {
  const list = Array.isArray(result) ? result : [result];
  return list
    .map((r) => (typeof r === "string" ? r : ((r as PickResult | null)?.url ?? (r as PickResult | null)?.publicUrl ?? (r as PickResult | null)?.src)))
    .filter((u): u is string => !!u);
}

const input =
  "w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/15";
const card = "rounded-3xl border border-[var(--color-border)] bg-white p-6 sm:p-8";
const iconBtn =
  "flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-text)] hover:text-[var(--color-text)] disabled:opacity-30 disabled:hover:border-[var(--color-border)] disabled:hover:text-[var(--color-text-muted)]";

const newId = () => crypto.randomUUID();
const emptyDraft = (): EventDraft => ({
  slug: "", title: "", summary: "", category: "stage", event_date: "", end_date: null,
  location: "", cover_url: null, status: "draft", sections: [], photos: [],
});
const toDraft = (row: EventRow): EventDraft => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { created_at, updated_at, ...rest } = row;
  return rest;
};
function move<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const copy = [...arr];
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-[var(--color-text-muted)]">{hint}</span>}
    </label>
  );
}

export default function AdminEvenement() {
  const [list, setList] = useState<EventCard[]>([]);
  const [listState, setListState] = useState<"loading" | "error" | "ready">("loading");
  const [draft, setDraft] = useState<EventDraft | null>(null);
  const [baseline, setBaseline] = useState("");
  const [slugLocked, setSlugLocked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pick, setPick] = useState<"cover" | "photos" | null>(null);

  const dirty = draft !== null && JSON.stringify(draft) !== baseline;

  const refresh = useCallback(() => {
    fetchAllEventsAdmin().then((rows) => { setList(rows); setListState("ready"); }).catch(() => setListState("error"));
  }, []);
  useEffect(refresh, [refresh]);

  // Alerte avant de quitter la page avec des modifications non enregistrées
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const confirmDiscard = () => !dirty || window.confirm("Des modifications ne sont pas enregistrées. Les abandonner ?");

  const load = (d: EventDraft, locked: boolean) => {
    setDraft(d); setBaseline(JSON.stringify(d)); setSlugLocked(locked); setMessage(null);
  };
  const openNew = () => { if (confirmDiscard()) load(emptyDraft(), false); };
  const openEvent = async (id: string) => {
    if (!confirmDiscard()) return;
    try {
      const row = await fetchEventById(id);
      if (row) load(toDraft(row), true);
    } catch { setMessage({ ok: false, text: "Impossible de charger cet évènement." }); }
  };

  const patch = (p: Partial<EventDraft>) => setDraft((d) => (d ? { ...d, ...p } : d));
  const setTitle = (title: string) =>
    setDraft((d) => (d ? { ...d, title, slug: slugLocked ? d.slug : slugify(title) } : d));

  /* ----- sections ----- */
  const addSection = () => draft && patch({ sections: [...draft.sections, { id: newId(), subtitle: "", body: "" }] });
  const editSection = (id: string, p: Partial<EventDraft["sections"][number]>) =>
    draft && patch({ sections: draft.sections.map((s) => (s.id === id ? { ...s, ...p } : s)) });

  /* ----- médias ----- */
  const handlePick = (result: unknown) => {
    const urls = toUrls(result);
    if (draft && urls.length) {
      if (pick === "cover") patch({ cover_url: urls[0] });
      else {
        const known = new Set(draft.photos.map((p) => p.url));
        patch({ photos: [...draft.photos, ...urls.filter((u) => !known.has(u)).map((url) => ({ id: newId(), url, alt: "" }))] });
      }
    }
    setPick(null);
  };

  /* ----- enregistrement ----- */
  const save = async () => {
    if (!draft) return;
    if (!draft.title.trim() || !draft.slug.trim() || !draft.event_date)
      return setMessage({ ok: false, text: "Le titre, le lien et la date de début sont obligatoires." });
    if (draft.end_date && draft.end_date < draft.event_date)
      return setMessage({ ok: false, text: "La date de fin doit suivre la date de début." });

    setSaving(true); setMessage(null);
    try {
      const row = await saveEvent({ ...draft, title: draft.title.trim(), end_date: draft.end_date || null });
      load(toDraft(row), true);
      setMessage({ ok: true, text: row.status === "published" ? "Enregistré et publié." : "Brouillon enregistré." });
      refresh();
    } catch (e) {
      const code = (e as { code?: string }).code;
      setMessage({ ok: false, text: code === "23505" ? "Ce lien est déjà utilisé par un autre évènement." : "L'enregistrement a échoué. Réessaie dans un instant." });
    } finally { setSaving(false); }
  };

  const remove = async () => {
    if (!draft?.id || !window.confirm(`Supprimer définitivement « ${draft.title} » ?`)) return;
    try { await deleteEvent(draft.id); setDraft(null); setBaseline(""); refresh(); }
    catch { setMessage({ ok: false, text: "La suppression a échoué." }); }
  };

  const plan = draft ? planLayout(draft.sections, draft.photos) : null;

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 text-[var(--color-text)]">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-500">Administration</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Évènements
          </h1>
        </div>
        <button type="button" onClick={openNew} className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent)]">
          <Plus size={16} aria-hidden />Nouvel évènement
        </button>
      </header>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* ============ LISTE ============ */}
        <aside className="lg:col-span-4">
          <div className="space-y-2 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
            {listState === "loading" && [0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-[var(--color-surface)]" />)}
            {listState === "error" && <p className="rounded-2xl bg-[var(--color-surface)] p-4 text-sm">Chargement impossible. <button type="button" onClick={refresh} className="font-semibold underline">Réessayer</button></p>}
            {listState === "ready" && list.length === 0 && <p className="rounded-2xl border border-dashed border-[var(--color-border)] p-6 text-center text-sm text-[var(--color-text-muted)]">Aucun évènement. Crée le premier !</p>}
            {list.map((e) => {
              const active = draft?.id === e.id;
              return (
                <button
                  key={e.id} type="button" onClick={() => openEvent(e.id)} aria-current={active ? "true" : undefined}
                  className={`flex w-full items-center gap-4 rounded-2xl border p-3 text-left transition-all duration-300 ${active ? "border-[var(--color-accent)] bg-[var(--color-surface)]" : "border-[var(--color-border)] bg-white hover:border-[var(--color-text)]"}`}
                >
                  <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[var(--color-surface)]">
                    {e.cover_url && <img src={e.cover_url} alt="" loading="lazy" className="h-full w-full object-cover" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{e.title}</span>
                    <span className="block text-xs text-[var(--color-text-muted)]">{new Date(`${e.event_date}T00:00:00`).toLocaleDateString("fr-FR")}</span>
                  </span>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${e.status === "published" ? "bg-[var(--color-accent)] text-white" : "bg-[var(--color-surface)] text-[var(--color-text-muted)]"}`}>
                    {e.status === "published" ? "Publié" : "Brouillon"}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* ============ ÉDITEUR ============ */}
        <section className="lg:col-span-8">
          {!draft ? (
            <div className="rounded-3xl border border-dashed border-[var(--color-border)] p-16 text-center">
              <span aria-hidden className="text-7xl font-semibold text-neutral-200">編</span>
              <p className="mt-4 font-semibold">Sélectionne un évènement ou crée-en un nouveau.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Informations */}
              <div className={`${card} space-y-6`}>
                <h2 className="text-xl font-semibold">Informations</h2>
                <Field label="Titre *"><input className={input} value={draft.title} onChange={(e) => setTitle(e.target.value)} placeholder="Stage de printemps avec Maître …" /></Field>
                <Field label="Lien de la page *" hint={draft.id ? "Modifier ce lien casse les liens déjà partagés." : "Généré depuis le titre, modifiable."}>
                  <div className="flex items-center overflow-hidden rounded-xl border border-[var(--color-border)] focus-within:border-[var(--color-accent)]">
                    <span className="bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text-muted)]">/evenements/</span>
                    <input className="w-full bg-white px-3 py-3 text-sm outline-none" value={draft.slug} onChange={(e) => { setSlugLocked(true); patch({ slug: slugify(e.target.value) }); }} />
                  </div>
                </Field>
                <Field label="Résumé" hint="Affiché sur la page d'accueil des évènements et sous le titre (≈ 160 caractères).">
                  <textarea className={input} rows={2} value={draft.summary} onChange={(e) => patch({ summary: e.target.value })} />
                </Field>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Catégorie">
                    <select className={input} value={draft.category} onChange={(e) => patch({ category: e.target.value as EventDraft["category"] })}>
                      {EVENT_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.fr}</option>)}
                    </select>
                  </Field>
                  <Field label="Lieu"><input className={input} value={draft.location} onChange={(e) => patch({ location: e.target.value })} placeholder="Dojo, ville…" /></Field>
                  <Field label="Date de début *"><input type="date" className={input} value={draft.event_date} onChange={(e) => patch({ event_date: e.target.value })} /></Field>
                  <Field label="Date de fin" hint="Laisse vide pour un évènement d'un seul jour.">
                    <input type="date" className={input} min={draft.event_date || undefined} value={draft.end_date ?? ""} onChange={(e) => patch({ end_date: e.target.value || null })} />
                  </Field>
                </div>
              </div>

              {/* Couverture */}
              <div className={card}>
                <h2 className="text-xl font-semibold">Image de couverture</h2>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">Sans couverture, la première photo est utilisée.</p>
                <div className="mt-6 flex flex-wrap items-center gap-5">
                  <div className="aspect-[16/9] w-64 overflow-hidden rounded-2xl bg-[var(--color-surface)]">
                    {draft.cover_url ? <img src={draft.cover_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-[var(--color-text-muted)]">Aucune couverture</div>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button type="button" onClick={() => setPick("cover")} className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold transition-colors hover:border-neutral-950 hover:bg-neutral-950 hover:text-white"><ImagePlus size={16} aria-hidden />{draft.cover_url ? "Changer" : "Choisir"}</button>
                    {draft.cover_url && <button type="button" onClick={() => patch({ cover_url: null })} className="text-sm text-[var(--color-text-muted)] underline">Retirer</button>}
                  </div>
                </div>
              </div>

              {/* Paragraphes */}
              <div className={`${card} space-y-5`}>
                <div>
                  <h2 className="text-xl font-semibold">Paragraphes</h2>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">Un sous-titre et un texte. Une ligne vide dans le texte crée un nouveau paragraphe.</p>
                </div>
                {draft.sections.map((s, i) => (
                  <div key={s.id} className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[var(--color-accent)]">Paragraphe {i + 1}</p>
                      <div className="flex gap-2">
                        <button type="button" className={iconBtn} disabled={i === 0} aria-label="Monter" onClick={() => patch({ sections: move(draft.sections, i, -1) })}><ArrowUp size={15} /></button>
                        <button type="button" className={iconBtn} disabled={i === draft.sections.length - 1} aria-label="Descendre" onClick={() => patch({ sections: move(draft.sections, i, 1) })}><ArrowDown size={15} /></button>
                        <button type="button" className={iconBtn} aria-label="Supprimer le paragraphe" onClick={() => patch({ sections: draft.sections.filter((x) => x.id !== s.id) })}><Trash2 size={15} /></button>
                      </div>
                    </div>
                    <input className={input} placeholder="Sous-titre" value={s.subtitle} onChange={(e) => editSection(s.id, { subtitle: e.target.value })} />
                    <textarea className={input} rows={6} placeholder="Texte du paragraphe…" value={s.body} onChange={(e) => editSection(s.id, { body: e.target.value })} />
                  </div>
                ))}
                <button type="button" onClick={addSection} className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold transition-colors hover:border-neutral-950 hover:bg-neutral-950 hover:text-white"><Plus size={16} aria-hidden />Ajouter un paragraphe</button>
              </div>

              {/* Photos */}
              <div className={`${card} space-y-5`}>
                <div>
                  <h2 className="text-xl font-semibold">Photos <span className="font-normal text-[var(--color-text-muted)]">({draft.photos.length})</span></h2>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">L'ordre ci-dessous est l'ordre d'affichage. La mise en page s'adapte toute seule au nombre de photos et de paragraphes.</p>
                </div>
                {draft.photos.length > 0 && (
                  <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {draft.photos.map((p, i) => (
                      <li key={p.id} className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white">
                        <div className="relative aspect-[4/3] bg-[var(--color-surface)]">
                          <img src={p.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                          <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-white">{i + 1}</span>
                          <div className="absolute inset-x-2 bottom-2 flex justify-between">
                            <div className="flex gap-1.5">
                              <button type="button" className={iconBtn} disabled={i === 0} aria-label="Avancer" onClick={() => patch({ photos: move(draft.photos, i, -1) })}><ArrowLeft size={15} /></button>
                              <button type="button" className={iconBtn} disabled={i === draft.photos.length - 1} aria-label="Reculer" onClick={() => patch({ photos: move(draft.photos, i, 1) })}><ArrowRight size={15} /></button>
                            </div>
                            <button type="button" className={iconBtn} aria-label="Retirer la photo" onClick={() => patch({ photos: draft.photos.filter((x) => x.id !== p.id) })}><X size={15} /></button>
                          </div>
                        </div>
                        <input className="w-full border-t border-[var(--color-border)] px-3 py-2.5 text-xs outline-none focus:bg-[var(--color-surface)]" placeholder="Légende / description (accessibilité)" value={p.alt ?? ""} onChange={(e) => patch({ photos: draft.photos.map((x) => (x.id === p.id ? { ...x, alt: e.target.value } : x)) })} />
                      </li>
                    ))}
                  </ul>
                )}
                <button type="button" onClick={() => setPick("photos")} className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold transition-colors hover:border-neutral-950 hover:bg-neutral-950 hover:text-white"><ImagePlus size={16} aria-hidden />Ajouter des photos</button>

                {plan && (draft.sections.length > 0 || draft.photos.length > 0) && (
                  <p className="rounded-2xl bg-[var(--color-surface)] px-5 py-4 text-sm leading-relaxed text-[var(--color-text-muted)]">
                    <span className="font-semibold text-[var(--color-text)]">Mise en page automatique : </span>
                    {plan.sections.length > 0
                      ? plan.sections.map((s, i) => `§${i + 1} → ${s.photos.length} photo${s.photos.length > 1 ? "s" : ""}`).join(" · ")
                      : "aucun paragraphe"}
                    {plan.gallery.length > 0 && ` · galerie finale : ${plan.gallery.length} photo${plan.gallery.length > 1 ? "s" : ""}`}
                  </p>
                )}
              </div>

              {/* Publication */}
              <div className={card}>
                <h2 className="text-xl font-semibold">Publication</h2>
                <div role="radiogroup" aria-label="Statut" className="mt-5 inline-flex rounded-full border border-[var(--color-border)] p-1">
                  {([["draft", "Brouillon"], ["published", "Publié"]] as const).map(([v, label]) => (
                    <button key={v} type="button" role="radio" aria-checked={draft.status === v} onClick={() => patch({ status: v })}
                      className={`rounded-full px-6 py-2 text-sm font-semibold transition-all duration-300 ${draft.status === v ? "bg-[var(--color-accent)] text-white" : "text-[var(--color-text-muted)]"}`}>{label}</button>
                  ))}
                </div>
                <p className="mt-3 text-sm text-[var(--color-text-muted)]">Un évènement publié apparaît dans l'index et dans le menu « Évènements » du site. Un brouillon reste visible uniquement par les administrateurs connectés.</p>
              </div>

              {/* Barre d'actions */}
              <div className="sticky bottom-4 z-20 space-y-3">
                {message && <p role="status" className={`rounded-2xl px-5 py-3 text-sm font-medium shadow-lg ${message.ok ? "bg-[var(--color-accent)] text-white" : "bg-red-600 text-white"}`}>{message.text}</p>}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--color-border)] bg-white/90 p-4 shadow-lg backdrop-blur">
                  <p className="text-sm text-[var(--color-text-muted)]">{dirty ? "Modifications non enregistrées" : draft.id ? "Tout est enregistré" : "Nouvel évènement"}</p>
                  <div className="flex flex-wrap gap-3">
                    {draft.id && <button type="button" onClick={remove} className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-600 hover:text-white"><Trash2 size={16} aria-hidden />Supprimer</button>}
                    {draft.id && <Link to={`/evenements/${draft.slug}`} target="_blank" className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2.5 text-sm font-semibold transition-colors hover:border-neutral-950 hover:bg-neutral-950 hover:text-white"><Eye size={16} aria-hidden />Voir la page</Link>}
                    <button type="button" onClick={save} disabled={saving || (!dirty && !!draft.id)} className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent)] disabled:opacity-40 disabled:hover:bg-[var(--color-primary)]">
                      {saving ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Save size={16} aria-hidden />}Enregistrer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {pick && <MediaPicker open multiple={pick === "photos"} onClose={() => setPick(null)} onSelect={handlePick} />}
    </main>
  );
}