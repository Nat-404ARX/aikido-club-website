import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  ImagePlus,
  LoaderCircle,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  formatFileSize,
  getMediaError,
  mediaService,
  type MediaFile,
} from "../../services/mediaServices.ts";

import {
  MEDIA_CATEGORIES,
  type MediaCategory,
} from "../../data/mediaCategories.ts"

export default function AdminMedia() {
  const [category, setCategory] = useState<MediaCategory>("accueil");
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [selected, setSelected] = useState<MediaFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await mediaService.list(category);
      setFiles(result);
    } catch (err) {
      setError(getMediaError(err));
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    void loadFiles();
  }, [loadFiles]);

  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const input = event.currentTarget;
    const selectedFiles = Array.from(input.files ?? []);

    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError(null);
    setNotice(null);

    let succeeded = 0;
    const failures: string[] = [];

    try {
      for (const file of selectedFiles) {
        try {
          await mediaService.upload(file, category);
          succeeded++;
        } catch (err) {
          failures.push(`${file.name} : ${getMediaError(err)}`);
        }
      }

      await loadFiles();

      if (failures.length > 0) {
        setError(
          [
            succeeded > 0
              ? `${succeeded} image(s) importée(s).`
              : "",
            ...failures,
          ]
            .filter(Boolean)
            .join("\n")
        );
      } else {
        setNotice(
          `${succeeded} image${succeeded > 1 ? "s" : ""} importée${succeeded > 1 ? "s" : ""} avec succès.`
        );
      }
    } finally {
      setUploading(false);
      input.value = "";
    }
  }

  async function handleCopy(media: MediaFile) {
    try {
      await navigator.clipboard.writeText(media.url);
      setCopiedPath(media.path);
      setNotice("URL publique copiée.");
      setError(null);
    } catch {
      setError(
        "Copie impossible. Ouvre l'image pour récupérer son URL manuellement."
      );
    }
  }

  async function handleDelete(media: MediaFile) {
    const confirmed = window.confirm(
      `Supprimer définitivement « ${media.name} » ?\n\nSi cette image est utilisée sur une page publiée, elle ne s'affichera plus.`
    );

    if (!confirmed) return;

    setDeleting(true);
    setError(null);
    setNotice(null);

    try {
      await mediaService.delete(media);
      setFiles((current) =>
        current.filter((file) => file.path !== media.path)
      );
      setSelected(null);
      setNotice("Image supprimée.");
    } catch (err) {
      setError(getMediaError(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-neutral-500">Administration</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Médiathèque
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
            Centralise les images du site pour les réutiliser dans les pages,
            les cours et les événements.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <Upload size={17} />
          )}
          {uploading ? "Import en cours…" : "Importer des images"}
        </button>

        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          multiple
          onChange={handleUpload}
          className="hidden"
          aria-label="Choisir les images à importer"
        />
      </header>

      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold">Catégories</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Choisis où consulter ou importer les images.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadFiles()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-50"
          >
            <RefreshCw size={15} />
            Actualiser
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {MEDIA_CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setCategory(item.id);
                setSelected(null);
                setError(null);
                setNotice(null);
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${category === item.id
                  ? "bg-neutral-950 text-white"
                  : "border border-neutral-200 hover:bg-neutral-50"
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900"
        >
          <Check size={17} className="mt-0.5 shrink-0" />
          {notice}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            {MEDIA_CATEGORIES.find((item) => item.id === category)?.label}
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            {loading
              ? "Chargement…"
              : `${files.length} image${files.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <span className="text-xs text-neutral-500">Maximum 5 Mo par image</span>
      </div>

      {loading ? (
        <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-neutral-500">
          <LoaderCircle size={20} className="animate-spin" />
          Chargement des médias…
        </div>
      ) : files.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white px-6 text-center">
          <ImagePlus size={36} className="text-neutral-400" />
          <h3 className="mt-4 font-semibold">Aucune image dans cette catégorie</h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500">
            Importe une photo pour commencer à constituer la bibliothèque.
          </p>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="mt-5 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            Choisir des images
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {files.map((media) => (
            <article
              key={media.path}
              className="overflow-hidden rounded-xl border border-neutral-200 bg-white"
            >
              <button
                type="button"
                onClick={() => setSelected(media)}
                className="group block aspect-[4/3] w-full overflow-hidden bg-neutral-100"
                aria-label={`Aperçu de ${media.name}`}
              >
                <img
                  src={media.url}
                  alt={media.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </button>

              <div className="space-y-3 p-4">
                <p className="truncate text-sm font-semibold" title={media.name}>
                  {media.name}
                </p>
                <div className="flex items-center justify-between gap-2 text-xs text-neutral-500">
                  <span>{formatFileSize(media.size)}</span>
                  <span>{media.contentType || "Image"}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void handleCopy(media)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50"
                  >
                    {copiedPath === media.path ? (
                      <Check size={15} />
                    ) : (
                      <Copy size={15} />
                    )}
                    Copier l’URL
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(media)}
                    disabled={deleting}
                    aria-label={`Supprimer ${media.name}`}
                    className="inline-flex items-center justify-center rounded-lg border border-red-200 p-2 text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="media-preview-title"
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2
                  id="media-preview-title"
                  className="truncate text-lg font-semibold"
                >
                  {selected.name}
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  {formatFileSize(selected.size)} · {selected.contentType}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Fermer l'aperçu"
                className="rounded-lg p-2 hover:bg-neutral-100"
              >
                <X size={19} />
              </button>
            </div>

            <img
              src={selected.url}
              alt={selected.name}
              className="mt-5 max-h-[55vh] w-full rounded-xl bg-neutral-100 object-contain"
            />

            <label className="mt-5 block text-sm font-medium">
              URL publique
              <input
                readOnly
                value={selected.url}
                onFocus={(event) => event.currentTarget.select()}
                className="mt-2 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
              />
            </label>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm hover:bg-neutral-50"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => void handleCopy(selected)}
                className="inline-flex items-center gap-2 rounded-lg bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-accent)]"
              >
                <Copy size={15} />
                Copier l'URL
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
