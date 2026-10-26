import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown, ArrowUp, ChevronDown, Eye, ImagePlus, Loader2, Plus, Save, Trash2, X,
} from "lucide-react";
import MediaPicker from "./MediaPicker.tsx";
import { toUrls } from "../../lib/mediaPick.ts";
import {
  BLOCK_LABELS, fetchClubPage, newBlock, newId, newSection, saveClubPage, slugify,
  type BlockType, type ClubBlock, type ClubPage, type ClubSection,
} from "../../lib/club.ts";

const input =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-900";
const panel = "rounded-xl border border-neutral-200 bg-white p-5 sm:p-6";
const ghost =
  "inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900";
const iconBtn =
  "flex size-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition hover:border-neutral-900 hover:text-neutral-900 disabled:opacity-30 disabled:hover:border-neutral-200 disabled:hover:text-neutral-500";
const KANJI = ["史", "場", "師", "心", "和", "道", "会", "今", "技", "武"];

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


function ItemRow({ i, count, onMove, onRemove, children }: { i: number; count: number; onMove: (d: -1 | 1) => void; onRemove: () => void; children: ReactNode }) {
  return (
    <li className="flex gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
      <div className="min-w-0 flex-1 space-y-2">{children}</div>
      <div className="flex shrink-0 flex-col gap-1.5">
        <button type="button" className={iconBtn} disabled={i === 0} aria-label="Monter" onClick={() => onMove(-1)}><ArrowUp className="size-4" /></button>
        <button type="button" className={iconBtn} disabled={i === count - 1} aria-label="Descendre" onClick={() => onMove(1)}><ArrowDown className="size-4" /></button>
        <button type="button" className={iconBtn} aria-label="Supprimer" onClick={onRemove}><Trash2 className="size-4" /></button>
      </div>
    </li>
  );
}


function BlockEditor({ block, onChange, onPickImages }: { block: ClubBlock; onChange: (b: ClubBlock) => void; onPickImages: () => void }) {
  switch (block.type) {
    case "text":
      return (
        <div className="space-y-3">
          <input className={input} placeholder="Sous-titre (facultatif)" value={block.subtitle} onChange={(e) => onChange({ ...block, subtitle: e.target.value })} />
          <textarea className={input} rows={7} placeholder="Texte… (une ligne vide = nouveau paragraphe)" value={block.body} onChange={(e) => onChange({ ...block, body: e.target.value })} />
        </div>
      );

    case "images":
      return (
        <div className="space-y-3">
          {block.images.length > 0 && (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {block.images.map((im, i) => (
                <li key={im.id} className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
                  <div className="relative aspect-[4/3] bg-neutral-100">
                    <img src={im.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                    <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between">
                      <div className="flex gap-1">
                        <button type="button" className={`${iconBtn} bg-white`} disabled={i === 0} aria-label="Avancer" onClick={() => onChange({ ...block, images: move(block.images, i, -1) })}><ArrowUp className="size-4 -rotate-90" /></button>
                        <button type="button" className={`${iconBtn} bg-white`} disabled={i === block.images.length - 1} aria-label="Reculer" onClick={() => onChange({ ...block, images: move(block.images, i, 1) })}><ArrowDown className="size-4 -rotate-90" /></button>
                      </div>
                      <button type="button" className={`${iconBtn} bg-white`} aria-label="Retirer" onClick={() => onChange({ ...block, images: block.images.filter((x) => x.id !== im.id) })}><X className="size-4" /></button>
                    </div>
                  </div>
                  <input className="w-full border-t border-neutral-200 px-2.5 py-2 text-xs outline-none focus:bg-neutral-50" placeholder="Description (accessibilité)" value={im.alt} onChange={(e) => onChange({ ...block, images: block.images.map((x) => (x.id === im.id ? { ...x, alt: e.target.value } : x)) })} />
                </li>
              ))}
            </ul>
          )}
          <button type="button" className={ghost} onClick={onPickImages}><ImagePlus className="size-4" aria-hidden />Ajouter des images</button>
          <input className={input} placeholder="Légende commune (facultatif)" value={block.caption} onChange={(e) => onChange({ ...block, caption: e.target.value })} />
          <p className="text-xs text-neutral-500">1 image : grand format · 2 : côte à côte · 3 : mosaïque · 4 et plus : galerie en colonnes.</p>
        </div>
      );

    case "timeline":
      return (
        <div className="space-y-3">
          <ul className="space-y-3">
            {block.items.map((it, i) => (
              <ItemRow key={it.id} i={i} count={block.items.length} onMove={(d) => onChange({ ...block, items: move(block.items, i, d) })} onRemove={() => onChange({ ...block, items: block.items.filter((x) => x.id !== it.id) })}>
                <div className="grid gap-2 sm:grid-cols-[8rem_1fr]">
                  <input className={input} placeholder="Année" value={it.year} onChange={(e) => onChange({ ...block, items: block.items.map((x) => (x.id === it.id ? { ...x, year: e.target.value } : x)) })} />
                  <input className={input} placeholder="Titre de l'étape" value={it.title} onChange={(e) => onChange({ ...block, items: block.items.map((x) => (x.id === it.id ? { ...x, title: e.target.value } : x)) })} />
                </div>
                <textarea className={input} rows={2} placeholder="Description" value={it.text} onChange={(e) => onChange({ ...block, items: block.items.map((x) => (x.id === it.id ? { ...x, text: e.target.value } : x)) })} />
              </ItemRow>
            ))}
          </ul>
          <button type="button" className={ghost} onClick={() => onChange({ ...block, items: [...block.items, { id: newId(), year: "", title: "", text: "" }] })}><Plus className="size-4" aria-hidden />Ajouter une étape</button>
        </div>
      );

    case "stats":
      return (
        <div className="space-y-3">
          <ul className="space-y-3">
            {block.items.map((it, i) => (
              <ItemRow key={it.id} i={i} count={block.items.length} onMove={(d) => onChange({ ...block, items: move(block.items, i, d) })} onRemove={() => onChange({ ...block, items: block.items.filter((x) => x.id !== it.id) })}>
                <div className="grid gap-2 sm:grid-cols-[8rem_1fr]">
                  <input className={input} placeholder="Valeur (ex. 120)" value={it.value} onChange={(e) => onChange({ ...block, items: block.items.map((x) => (x.id === it.id ? { ...x, value: e.target.value } : x)) })} />
                  <input className={input} placeholder="Libellé (ex. Licenciés)" value={it.label} onChange={(e) => onChange({ ...block, items: block.items.map((x) => (x.id === it.id ? { ...x, label: e.target.value } : x)) })} />
                </div>
              </ItemRow>
            ))}
          </ul>
          <button type="button" className={ghost} onClick={() => onChange({ ...block, items: [...block.items, { id: newId(), value: "", label: "" }] })}><Plus className="size-4" aria-hidden />Ajouter un chiffre</button>
          <p className="text-xs text-neutral-500">Les nombres s'animent au défilement (sauf les années).</p>
        </div>
      );

    case "quote":
      return (
        <div className="space-y-3">
          <textarea className={input} rows={3} placeholder="Citation" value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} />
          <input className={input} placeholder="Auteur (facultatif)" value={block.author} onChange={(e) => onChange({ ...block, author: e.target.value })} />
        </div>
      );
  }
}

/* ------------------------------------------------------------------ */
type PickTarget = { kind: "hero" } | { kind: "images"; sectionId: string; blockId: string } | null;

export default function AdminClub() {
  const [page, setPage] = useState<ClubPage | null>(null);
  const [baseline, setBaseline] = useState("");
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [pick, setPick] = useState<PickTarget>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const dirty = page !== null && JSON.stringify(page) !== baseline;

  const load = useCallback(() => {
    setState("loading");
    fetchClubPage()
      .then((p) => { setPage(p); setBaseline(JSON.stringify(p)); setOpen(new Set(p.sections[0] ? [p.sections[0].id] : [])); setState("ready"); })
      .catch(() => setState("error"));
  }, []);
  useEffect(load, [load]);

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  /* ----- mises à jour immuables ----- */
  const patchPage = (p: Partial<ClubPage>) => setPage((cur) => (cur ? { ...cur, ...p } : cur));
  const updateSection = (sid: string, fn: (s: ClubSection) => ClubSection) =>
    setPage((cur) => (cur ? { ...cur, sections: cur.sections.map((s) => (s.id === sid ? fn(s) : s)) } : cur));
  const updateBlock = (sid: string, bid: string, b: ClubBlock) =>
    updateSection(sid, (s) => ({ ...s, blocks: s.blocks.map((x) => (x.id === bid ? b : x)) }));
  const toggle = (id: string) => setOpen((o) => { const n = new Set(o); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const addSection = () => {
    const s = newSection();
    patchPage({ sections: [...(page?.sections ?? []), s] });
    setOpen((o) => new Set(o).add(s.id));
  };

  const handlePick = (result: unknown) => {
    const urls = toUrls(result);
    if (pick && urls.length) {
      if (pick.kind === "hero") patchPage({ hero_image_url: urls[0] });
      else {
        updateSection(pick.sectionId, (s) => ({
          ...s,
          blocks: s.blocks.map((b) => {
            if (b.id !== pick.blockId || b.type !== "images") return b;
            const known = new Set(b.images.map((i) => i.url));
            return { ...b, images: [...b.images, ...urls.filter((u) => !known.has(u)).map((url) => ({ id: newId(), url, alt: "" }))] };
          }),
        }));
      }
    }
    setPick(null);
  };

  const save = async () => {
    if (!page) return;
    const slugs = new Set<string>();
    for (const [i, s] of page.sections.entries()) {
      const n = i + 1;
      if (!s.title.trim() || !s.navLabel.trim()) return setMessage({ ok: false, text: `Section ${n} : le titre et le libellé de navigation sont obligatoires.` });
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s.slug)) return setMessage({ ok: false, text: `Section ${n} : le lien (ancre) est invalide.` });
      if (slugs.has(s.slug)) return setMessage({ ok: false, text: `Section ${n} : le lien « ${s.slug} » est déjà utilisé.` });
      slugs.add(s.slug);
    }
    setSaving(true); setMessage(null);
    try {
      const saved = await saveClubPage(page);
      setPage(saved); setBaseline(JSON.stringify(saved));
      setMessage({ ok: true, text: "Page enregistrée." });
    } catch {
      setMessage({ ok: false, text: "L'enregistrement a échoué. Réessaie dans un instant." });
    } finally { setSaving(false); }
  };

  /* ------------------------------------------------------------------ */
  if (state === "loading") return <main className="mx-auto max-w-4xl p-6"><div className="h-64 animate-pulse rounded-xl bg-neutral-100" /></main>;
  if (state === "error" || !page)
    return (
      <main className="mx-auto max-w-4xl p-6 text-center">
        <p className="font-medium text-neutral-900">Impossible de charger la page du club.</p>
        <button type="button" onClick={load} className={`${ghost} mt-4`}>Réessayer</button>
      </main>
    );

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6 pb-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Page du club</h1>
          <p className="mt-1 text-sm text-neutral-500">Construisez la page section par section. Chaque section apparaît dans la navigation secondaire de la page.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/club" target="_blank" className={ghost}><Eye className="size-4" aria-hidden />Voir la page</Link>
          <button type="button" onClick={save} disabled={saving || !dirty} className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-40">
            {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}Enregistrer
          </button>
        </div>
      </header>

      {/* Image d'en-tête */}
      <section className={panel}>
        <h2 className="text-base font-semibold text-neutral-900">Image d'en-tête</h2>
        <p className="mt-1 text-sm text-neutral-500">Grande image sous le titre de la page (facultative).</p>
        <div className="mt-4 flex flex-wrap items-start gap-4">
          <div className="aspect-[16/9] w-56 overflow-hidden rounded-lg bg-neutral-100">
            {page.hero_image_url ? <img src={page.hero_image_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-neutral-400">Aucune image</div>}
          </div>
          <div className="min-w-0 flex-1 space-y-3" style={{ minWidth: "14rem" }}>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={ghost} onClick={() => setPick({ kind: "hero" })}><ImagePlus className="size-4" aria-hidden />{page.hero_image_url ? "Changer" : "Choisir"}</button>
              {page.hero_image_url && <button type="button" className={ghost} onClick={() => patchPage({ hero_image_url: null })}>Retirer</button>}
            </div>
            <input className={input} placeholder="Description de l'image (accessibilité)" value={page.hero_image_alt} onChange={(e) => patchPage({ hero_image_alt: e.target.value })} />
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-neutral-900">Sections <span className="font-normal text-neutral-500">({page.sections.length})</span></h2>

        {page.sections.length === 0 && <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">Aucune section. Ajoute la première !</p>}

        {page.sections.map((s, i) => {
          const isOpen = open.has(s.id);
          return (
            <article key={s.id} className="rounded-xl border border-neutral-200 bg-white">
              <div className="flex items-center gap-3 p-3 sm:p-4">
                <button type="button" onClick={() => toggle(s.id)} aria-expanded={isOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-lg text-neutral-700">{s.kanji || "·"}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-neutral-900">{s.title || "Section sans titre"}</span>
                    <span className="block text-xs text-neutral-500">{s.blocks.length} bloc{s.blocks.length > 1 ? "s" : ""}</span>
                  </span>
                  <ChevronDown className={`ml-auto size-5 shrink-0 text-neutral-400 transition ${isOpen ? "rotate-180" : ""}`} aria-hidden />
                </button>
                <div className="flex shrink-0 gap-1.5">
                  <button type="button" className={iconBtn} disabled={i === 0} aria-label="Monter la section" onClick={() => patchPage({ sections: move(page.sections, i, -1) })}><ArrowUp className="size-4" /></button>
                  <button type="button" className={iconBtn} disabled={i === page.sections.length - 1} aria-label="Descendre la section" onClick={() => patchPage({ sections: move(page.sections, i, 1) })}><ArrowDown className="size-4" /></button>
                  <button type="button" className={iconBtn} aria-label="Supprimer la section" onClick={() => window.confirm(`Supprimer la section « ${s.title || "sans titre"} » ?`) && patchPage({ sections: page.sections.filter((x) => x.id !== s.id) })}><Trash2 className="size-4" /></button>
                </div>
              </div>

              {isOpen && (
                <div className="space-y-5 border-t border-neutral-200 p-4 sm:p-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Titre *"><input className={input} value={s.title} onChange={(e) => updateSection(s.id, (x) => ({ ...x, title: e.target.value }))} /></Field>
                    <Field label="Libellé dans la navigation *" hint="Le lien (ancre) se met à jour automatiquement.">
                      <input
                        className={input} value={s.navLabel}
                        onChange={(e) => updateSection(s.id, (x) => ({ ...x, navLabel: e.target.value, slug: !x.slug || x.slug === slugify(x.navLabel) ? slugify(e.target.value) : x.slug }))}
                      />
                    </Field>
                    <Field label="Lien de la section" hint={`Adresse : /club#${s.slug || "…"}`}><input className={input} value={s.slug} onChange={(e) => updateSection(s.id, (x) => ({ ...x, slug: slugify(e.target.value) }))} /></Field>
                    <Field label="Kanji décoratif" hint="1 ou 2 caractères.">
                      <input className={input} maxLength={2} value={s.kanji} onChange={(e) => updateSection(s.id, (x) => ({ ...x, kanji: e.target.value }))} />
                      <span className="mt-2 flex flex-wrap gap-1.5">
                        {KANJI.map((k) => <button key={k} type="button" onClick={() => updateSection(s.id, (x) => ({ ...x, kanji: k }))} className="size-8 rounded-md border border-neutral-200 text-base text-neutral-700 hover:border-neutral-900">{k}</button>)}
                      </span>
                    </Field>
                  </div>
                  <Field label="Sous-titre / introduction"><textarea className={input} rows={2} value={s.subtitle} onChange={(e) => updateSection(s.id, (x) => ({ ...x, subtitle: e.target.value }))} /></Field>

                  {/* Blocs */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-neutral-900">Contenu de la section</h3>
                    {s.blocks.map((b, bi) => (
                      <div key={b.id} className="rounded-lg border border-neutral-200 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-sm font-medium text-neutral-700">{BLOCK_LABELS[b.type]}</p>
                          <div className="flex gap-1.5">
                            <button type="button" className={iconBtn} disabled={bi === 0} aria-label="Monter" onClick={() => updateSection(s.id, (x) => ({ ...x, blocks: move(x.blocks, bi, -1) }))}><ArrowUp className="size-4" /></button>
                            <button type="button" className={iconBtn} disabled={bi === s.blocks.length - 1} aria-label="Descendre" onClick={() => updateSection(s.id, (x) => ({ ...x, blocks: move(x.blocks, bi, 1) }))}><ArrowDown className="size-4" /></button>
                            <button type="button" className={iconBtn} aria-label="Supprimer le bloc" onClick={() => updateSection(s.id, (x) => ({ ...x, blocks: x.blocks.filter((y) => y.id !== b.id) }))}><Trash2 className="size-4" /></button>
                          </div>
                        </div>
                        <BlockEditor block={b} onChange={(nb) => updateBlock(s.id, b.id, nb)} onPickImages={() => setPick({ kind: "images", sectionId: s.id, blockId: b.id })} />
                      </div>
                    ))}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-neutral-500">Ajouter :</span>
                      {(Object.keys(BLOCK_LABELS) as BlockType[]).map((t) => (
                        <button key={t} type="button" className={ghost} onClick={() => updateSection(s.id, (x) => ({ ...x, blocks: [...x.blocks, newBlock(t)] }))}><Plus className="size-4" aria-hidden />{BLOCK_LABELS[t]}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })}

        <button type="button" onClick={addSection} className={ghost}><Plus className="size-4" aria-hidden />Ajouter une section</button>
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

      {pick && <MediaPicker open multiple={pick.kind === "images"} onClose={() => setPick(null)} onSelect={handlePick} />}
    </main>
  );
}