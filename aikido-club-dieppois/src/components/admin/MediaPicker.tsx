import { useEffect, useState } from "react";
import { Check, Image, LoaderCircle, X } from "lucide-react";
import {
  getMediaError,
  mediaService,
  type MediaFile,
} from "../../services/mediaServices.ts";

import { MEDIA_CATEGORIES, type MediaCategory } from "../../data/mediaCategories.ts"

interface MediaPickerProps {
  onSelect: (media: MediaFile) => void;
  initialCategory?: MediaCategory;
  label?: string;
}

export default function MediaPicker({
  onSelect,
  initialCategory = "accueil",
  label = "Choisir une image",
}: MediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<MediaCategory>(initialCategory);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const result = await mediaService.list(category);
        if (!cancelled) setFiles(result);
      } catch (err) {
        if (!cancelled) setError(getMediaError(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, category]);

  function choose(media: MediaFile) {
    onSelect(media);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium transition hover:bg-neutral-50"
      >
        <Image size={17} />
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="media-picker-title"
            className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white"
          >
            <header className="flex items-center justify-between gap-4 border-b border-neutral-200 p-5">
              <div>
                <h2 id="media-picker-title" className="text-lg font-semibold">
                  Bibliothèque de médias
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Sélectionne une image pour ce contenu.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer la bibliothèque"
                className="rounded-lg p-2 hover:bg-neutral-100"
              >
                <X size={19} />
              </button>
            </header>

            <div className="flex flex-wrap gap-2 border-b border-neutral-200 p-4">
              {MEDIA_CATEGORIES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCategory(item.id)}
                  className={`rounded-lg px-3 py-2 text-sm ${category === item.id
                      ? "bg-neutral-950 text-white"
                      : "border border-neutral-200 hover:bg-neutral-50"
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                >
                  {error}
                </p>
              )}

              {loading ? (
                <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-neutral-500">
                  <LoaderCircle size={19} className="animate-spin" />
                  Chargement des images…
                </div>
              ) : files.length === 0 && !error ? (
                <div className="flex min-h-48 flex-col items-center justify-center text-center">
                  <Image size={32} className="text-neutral-400" />
                  <p className="mt-3 font-medium">Aucune image disponible</p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Importe d'abord une image depuis la médiathèque.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {files.map((media) => (
                    <button
                      key={media.path}
                      type="button"
                      onClick={() => choose(media)}
                      className="group overflow-hidden rounded-xl border border-neutral-200 text-left transition hover:border-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950"
                    >
                      <div className="relative aspect-[4/3] bg-neutral-100">
                        <img
                          src={media.url}
                          alt={media.name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
                          <Check
                            size={28}
                            className="text-white opacity-0 drop-shadow transition group-hover:opacity-100"
                          />
                        </span>
                      </div>
                      <span className="block truncate p-3 text-xs font-medium">
                        {media.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <footer className="border-t border-neutral-200 p-4 text-right">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm hover:bg-neutral-50"
              >
                Annuler
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
