import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp, ChevronDown, Eye, EyeOff, ImagePlus, Loader2, Plus, Save, Trash2 } from "lucide-react";
import MediaPicker from "../../components/admin/MediaPicker.tsx";
import { toUrls } from "../../lib/mediaPick.ts";
import {
  COURSE_LANGS, DAYS, DAY_FR, EMPTY_TEXT, fetchAllCourses, formatTime, newId, saveCourses, slugify,
  type CourseLang, type CourseRow, type CourseSlot, type CourseText, type DayKey,
} from "../../data/cours.ts";

/* ------------------------------------------------------------------ */
const input =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-900";
const panel = "rounded-xl border border-neutral-200 bg-white p-5 sm:p-6";
const ghost =
  "inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900";
const iconBtn =
  "flex size-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition hover:border-neutral-900 hover:text-neutral-900 disabled:opacity-30 disabled:hover:border-neutral-200 disabled:hover:text-neutral-500";
const KANJI = ["皆", "若", "剣", "体", "段", "題", "杖", "技", "武", "和"];

function move<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const copy = [...arr];
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-neutral-800">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-neutral-500">{hint}</span>}
    </label>
  );
}

const newCourse = (position: number): CourseRow => ({
  id: newId(), slug: "", kanji: "", image_url: null, position, is_active: true, slots: [],
  translations: { fr: { ...EMPTY_TEXT }, en: { ...EMPTY_TEXT } },
});


export default function AdminCours() {
  const [rows, setRows] = useState<CourseRow[] | null>(null);
  const [baseline, setBaseline] = useState("");
  const [loadedIds, setLoadedIds] = useState<string[]>([]);
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");
  const [lang, setLang] = useState<CourseLang>("fr");
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [pickFor, setPickFor] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const dirty = rows !== null && JSON.stringify(rows) !== baseline;

  const load = useCallback(() => {
    setState("loading");
    fetchAllCourses()
      .then((r) => { setRows(r); setBaseline(JSON.stringify(r)); setLoadedIds(r.map((c) => c.id)); setState("ready"); })
      .catch(() => setState("error"));
  }, []);
  useEffect(load, [load]);

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  /* ----- mises à jour ----- */
  const update = (id: string, fn: (c: CourseRow) => CourseRow) =>
    setRows((cur) => (cur ? cur.map((c) => (c.id === id ? fn(c) : c)) : cur));
  const setText = (id: string, k: keyof CourseText, v: string) =>
    update(id, (c) => {
      const tr = c.translations[lang] ?? EMPTY_TEXT;
      const prevName = c.translations.fr?.name ?? "";
      const next = { ...c, translations: { ...c.translations, [lang]: { ...tr, [k]: v } } };
      // le lien suit le nom français tant qu'il n'a pas été modifié à la main
      if (lang === "fr" && k === "name" && (!c.slug || c.slug === slugify(prevName))) next.slug = slugify(v);
      return next;
    });
  const setSlot = (cid: string, sid: string, p: Partial<CourseSlot>) =>
    update(cid, (c) => ({ ...c, slots: c.slots.map((s) => (s.id === sid ? { ...s, ...p } : s)) }));
  const toggle = (id: string) => setOpen((o) => { const n = new Set(o); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const addCourse = () => {
    const c = newCourse(rows?.length ?? 0);
    setRows((cur) => [...(cur ?? []), c]);
    setOpen((o) => new Set(o).add(c.id));
  };

  const handlePick = (result: unknown) => {
    const [url] = toUrls(result);
    if (pickFor && url) update(pickFor, (c) => ({ ...c, image_url: url }));
    setPickFor(null);
  };

  /* ----- vue de la semaine (aperçu du brouillon) ----- */
  const week = useMemo(
    () =>
      DAYS.map((day) => ({
        day,
        items: (rows ?? [])
          .flatMap((c) => c.slots.filter((s) => s.day === day).map((s) => ({ key: `${c.id}-${s.id}`, name: c.translations.fr?.name || c.slug || "Sans nom", start: s.start, end: s.end, hidden: !c.is_active })))
          .sort((a, b) => (a.start ?? "99:99").localeCompare(b.start ?? "99:99")),
      })),
    [rows],
  );

  /* ----- enregistrement ----- */
  const save = async () => {
    if (!rows) return;
    const slugs = new Set<string>();
    for (const [i, c] of rows.entries()) {
      const n = `Cours ${i + 1}`;
      if (!c.translations.fr?.name?.trim()) return setMessage({ ok: false, text: `${n} : le nom en français est obligatoire.` });
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(c.slug)) return setMessage({ ok: false, text: `${n} : le lien est invalide (lettres minuscules, chiffres et tirets).` });
      if (slugs.has(c.slug)) return setMessage({ ok: false, text: `${n} : le lien « ${c.slug} » est déjà utilisé.` });
      slugs.add(c.slug);
      for (const s of c.slots) {
        if (s.end && !s.start) return setMessage({ ok: false, text: `${n} (${DAY_FR[s.day]}) : indique une heure de début.` });
        if (s.start && s.end && s.end <= s.start) return setMessage({ ok: false, text: `${n} (${DAY_FR[s.day]}) : l'heure de fin doit suivre l'heure de début.` });
      }
    }
    setSaving(true); setMessage(null);
    try {
      const deleted = loadedIds.filter((id) => !rows.some((c) => c.id === id));
      const saved = await saveCourses(rows, deleted);
      setRows(saved); setBaseline(JSON.stringify(saved)); setLoadedIds(saved.map((c) => c.id));
      setMessage({ ok: true, text: "Cours enregistrés : le site est à jour." });
    } catch (e) {
      const code = (e as { code?: string }).code;
      setMessage({ ok: false, text: code === "23505" ? "Deux cours ont le même lien." : "L'enregistrement a échoué. Réessaie dans un instant." });
    } finally { setSaving(false); }
  };

  /* ------------------------------------------------------------------ */
  if (state === "loading") return <main className="mx-auto max-w-4xl p-6"><div className="h-64 animate-pulse rounded-xl bg-neutral-100" /></main>;
  if (state === "error" || !rows)
    return (
      <main className="mx-auto max-w-4xl p-6 text-center">
        <p className="font-medium text-neutral-900">Impossible de charger les cours.</p>
        <button type="button" onClick={load} className={`${ghost} mt-4`}>Réessayer</button>
      </main>
    );

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6 pb-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Cours et horaires</h1>
          <p className="mt-1 text-sm text-neutral-500">Ces données alimentent la page Cours <em>et</em> la page Horaires & tarifs.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/cours" target="_blank" className={ghost}><Eye className="size-4" aria-hidden />Page Cours</Link>
          <button type="button" onClick={save} disabled={saving || !dirty} className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-40">
            {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}Enregistrer
          </button>
        </div>
      </header>

      {/* Vue de la semaine */}
      <section className={panel}>
        <h2 className="text-base font-semibold text-neutral-900">Vue de la semaine</h2>
        <p className="mt-1 text-sm text-neutral-500">Aperçu en direct de vos modifications (avant enregistrement).</p>
        <div className="mt-4 overflow-x-auto">
          <div className="grid min-w-[44rem] grid-cols-7 gap-2">
            {week.map(({ day, items }) => (
              <div key={day} className="min-w-0 rounded-lg border border-neutral-200 bg-neutral-50 p-2">
                <p className="text-xs font-semibold text-neutral-700">{DAY_FR[day]}</p>
                <ul className="mt-2 space-y-1.5">
                  {items.length === 0 && <li className="text-xs text-neutral-400">—</li>}
                  {items.map((it) => (
                    <li key={it.key} className={`rounded-md bg-white px-2 py-1.5 text-xs ${it.hidden ? "opacity-50" : ""}`}>
                      <span className="block font-semibold tabular-nums text-neutral-900">{formatTime(it.start, "fr") ?? "À compléter"}{it.end ? `–${formatTime(it.end, "fr")}` : ""}</span>
                      <span className="block break-words text-neutral-600">{it.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Langue d'édition */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-neutral-900">Cours <span className="font-normal text-neutral-500">({rows.length})</span></h2>
        <div role="radiogroup" aria-label="Langue des textes" className="inline-flex rounded-lg border border-neutral-200 bg-white p-1">
          {COURSE_LANGS.map((l) => (
            <button key={l.id} type="button" role="radio" aria-checked={lang === l.id} onClick={() => setLang(l.id)}
              className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition ${lang === l.id ? "bg-neutral-900 text-white" : "text-neutral-600 hover:text-neutral-900"}`}>{l.label}</button>
          ))}
        </div>
      </section>

      {/* Liste des cours */}
      <section className="space-y-3">
        {rows.length === 0 && <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">Aucun cours. Ajoute le premier !</p>}

        {rows.map((c, i) => {
          const isOpen = open.has(c.id);
          const tr = c.translations[lang] ?? EMPTY_TEXT;
          return (
            <article key={c.id} className={`rounded-xl border bg-white ${c.is_active ? "border-neutral-200" : "border-dashed border-neutral-300"}`}>
              <div className="flex items-center gap-3 p-3 sm:p-4">
                <button type="button" onClick={() => toggle(c.id)} aria-expanded={isOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-lg text-neutral-700">{c.kanji || "·"}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-neutral-900">{c.translations.fr?.name || "Nouveau cours"}</span>
                    <span className="block text-xs text-neutral-500">
                      {c.slots.length} créneau{c.slots.length > 1 ? "x" : ""}{!c.is_active && " · masqué sur le site"}
                    </span>
                  </span>
                  <ChevronDown className={`ml-auto size-5 shrink-0 text-neutral-400 transition ${isOpen ? "rotate-180" : ""}`} aria-hidden />
                </button>
                <div className="flex shrink-0 gap-1.5">
                  <button type="button" className={iconBtn} disabled={i === 0} aria-label="Monter" onClick={() => setRows(move(rows, i, -1))}><ArrowUp className="size-4" /></button>
                  <button type="button" className={iconBtn} disabled={i === rows.length - 1} aria-label="Descendre" onClick={() => setRows(move(rows, i, 1))}><ArrowDown className="size-4" /></button>
                  <button type="button" className={iconBtn} aria-label="Supprimer le cours" onClick={() => window.confirm(`Supprimer le cours « ${c.translations.fr?.name || "sans nom"} » ? Il disparaîtra aussi de la page Horaires.`) && setRows(rows.filter((x) => x.id !== c.id))}><Trash2 className="size-4" /></button>
                </div>
              </div>

              {isOpen && (
                <div className="space-y-6 border-t border-neutral-200 p-4 sm:p-5">
                  {/* Textes (langue choisie) */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-neutral-900">Textes · {COURSE_LANGS.find((l) => l.id === lang)?.label}</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label={lang === "fr" ? "Nom du cours *" : "Nom du cours"}><input className={input} value={tr.name} onChange={(e) => setText(c.id, "name", e.target.value)} /></Field>
                      <Field label="Public"><input className={input} placeholder="Adultes, 12 – 17 ans…" value={tr.audience} onChange={(e) => setText(c.id, "audience", e.target.value)} /></Field>
                    </div>
                    <Field label="Étiquette" hint="Petit mot-clé affiché à côté du public (ex. Préparation physique)."><input className={input} value={tr.tag} onChange={(e) => setText(c.id, "tag", e.target.value)} /></Field>
                    <Field label="Description" hint="Affichée sur la page Cours et dans le détail du jour de la page Horaires."><textarea className={input} rows={4} value={tr.description} onChange={(e) => setText(c.id, "description", e.target.value)} /></Field>
                    {lang === "en" && <p className="text-xs text-neutral-500">Un champ anglais laissé vide affiche automatiquement le texte français.</p>}
                  </div>

                  {/* Créneaux */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-neutral-900">Créneaux hebdomadaires</h3>
                    {c.slots.length === 0 && <p className="text-sm text-neutral-500">Aucun créneau : le cours n'apparaîtra pas dans la page Horaires.</p>}
                    <ul className="space-y-2">
                      {c.slots.map((s) => (
                        <li key={s.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-2.5">
                          <select className={`${input} !w-36`} value={s.day} aria-label="Jour" onChange={(e) => setSlot(c.id, s.id, { day: e.target.value as DayKey })}>
                            {DAYS.map((d) => <option key={d} value={d}>{DAY_FR[d]}</option>)}
                          </select>
                          <input type="time" className={`${input} !w-32`} aria-label="Début" value={s.start ?? ""} onChange={(e) => setSlot(c.id, s.id, { start: e.target.value || null })} />
                          <span className="text-neutral-400" aria-hidden>→</span>
                          <input type="time" className={`${input} !w-32`} aria-label="Fin" value={s.end ?? ""} onChange={(e) => setSlot(c.id, s.id, { end: e.target.value || null })} />
                          <button type="button" className={`${iconBtn} ml-auto`} aria-label="Supprimer le créneau" onClick={() => update(c.id, (x) => ({ ...x, slots: x.slots.filter((y) => y.id !== s.id) }))}><Trash2 className="size-4" /></button>
                        </li>
                      ))}
                    </ul>
                    <button type="button" className={ghost} onClick={() => update(c.id, (x) => ({ ...x, slots: [...x.slots, { id: newId(), day: "mon", start: null, end: null }] }))}><Plus className="size-4" aria-hidden />Ajouter un créneau</button>
                    <p className="text-xs text-neutral-500">Sans heure, le créneau s'affiche « À compléter ».</p>
                  </div>

                  {/* Apparence */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-neutral-900">Apparence et publication</h3>
                    <div className="flex flex-wrap items-start gap-4">
                      <div className="aspect-[4/5] w-32 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                        {c.image_url ? <img src={c.image_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center px-2 text-center text-xs text-neutral-400">Aucune image</div>}
                      </div>
                      <div className="min-w-[14rem] flex-1 space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <button type="button" className={ghost} onClick={() => setPickFor(c.id)}><ImagePlus className="size-4" aria-hidden />{c.image_url ? "Changer l'image" : "Choisir une image"}</button>
                          {c.image_url && <button type="button" className={ghost} onClick={() => update(c.id, (x) => ({ ...x, image_url: null }))}>Retirer</button>}
                        </div>
                        <input className={input} placeholder="ou URL / chemin : /assets/images/cours/…" value={c.image_url ?? ""} onChange={(e) => update(c.id, (x) => ({ ...x, image_url: e.target.value || null }))} />
                        <input className={input} placeholder={`Description de l'image (${lang === "fr" ? "français" : "anglais"})`} value={tr.alt} onChange={(e) => setText(c.id, "alt", e.target.value)} />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Kanji décoratif">
                        <input className={input} maxLength={2} value={c.kanji} onChange={(e) => update(c.id, (x) => ({ ...x, kanji: e.target.value }))} />
                        <span className="mt-2 flex flex-wrap gap-1.5">
                          {KANJI.map((k) => <button key={k} type="button" onClick={() => update(c.id, (x) => ({ ...x, kanji: k }))} className="size-8 rounded-md border border-neutral-200 text-base text-neutral-700 hover:border-neutral-900">{k}</button>)}
                        </span>
                      </Field>
                      <Field label="Lien (ancre)" hint={`Adresse : /cours#${c.slug || "…"} — le modifier casse les liens existants.`}>
                        <input className={input} value={c.slug} onChange={(e) => update(c.id, (x) => ({ ...x, slug: slugify(e.target.value) }))} />
                      </Field>
                    </div>

                    <button type="button" onClick={() => update(c.id, (x) => ({ ...x, is_active: !x.is_active }))} className={ghost}>
                      {c.is_active ? <><Eye className="size-4" aria-hidden />Visible sur le site</> : <><EyeOff className="size-4" aria-hidden />Masqué sur le site</>}
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}

        <button type="button" onClick={addCourse} className={ghost}><Plus className="size-4" aria-hidden />Ajouter un cours</button>
      </section>

      {/* Barre d'enregistrement */}
      <div className="sticky bottom-3 z-10 space-y-2">
        {message && <p role="status" className={`rounded-lg px-4 py-2.5 text-sm font-medium ${message.ok ? "bg-neutral-900 text-white" : "bg-red-600 text-white"}`}>{message.text}</p>}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white/95 p-3 shadow-sm backdrop-blur">
          <p className="text-sm text-neutral-500">{dirty ? "Modifications non enregistrées" : "Tout est enregistré"}</p>
          <button type="button" onClick={save} disabled={saving || !dirty} className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-40">
            {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}Enregistrer
          </button>
        </div>
      </div>

      {pickFor && <MediaPicker open onClose={() => setPickFor(null)} onSelect={handlePick} />}
    </main>
  );
}