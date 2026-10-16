import { useState, useEffect } from "react";
import { Eye, Image as ImageIcon, Save } from "lucide-react";
import {
  defaultHeroBanner,
  getHeroBanner,
  saveHeroBanner,
  type HeroBannerData,
} from "../../services/heroBannerService";


export default function AdminAccueil() {return(<></>)} 

{/*
const [banner, setBanner] = useState<HeroBannerData>(defaultHeroBanner);
const [isLoading, setIsLoading] = useState(true);
const [isSaving, setIsSaving] = useState(false);
const [statusMessage, setStatusMessage] = useState("");
const [errorMessage, setErrorMessage] = useState("");

useEffect(() => {
  let active = true;

  getHeroBanner()
    .then((data) => {
      if (active) setBanner(data);
    })
    .catch(() => {
      if (active) {
        setErrorMessage("Impossible de charger la bannière.");
      }
    })
    .finally(() => {
      if (active) setIsLoading(false);
    });

  return () => {
    active = false;
  };
}, []);


async function handleSave() {
  setIsSaving(true);
  setErrorMessage("");
  setStatusMessage("");

  try {
    await saveHeroBanner(banner);
    setStatusMessage("Bannière enregistrée avec succès.");
  } catch {
    setErrorMessage(
      "Enregistrement impossible. Vérifie la connexion et les autorisations Supabase.",
    );
  } finally {
    setIsSaving(false);
  }
}

export default function AdminAccueil() {
  const [banner, setBanner] = useState<HeroBannerData>(defaultHeroBanner);

  function updateField<K extends keyof HeroBannerData>(
    field: K,
    value: HeroBannerData[K],
  ) {
    setBanner((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="space-y-8">
      <header>
        <p className="text-sm font-medium text-neutral-500">
          Administration / Pages / Accueil
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Page d’accueil
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-500">
          Modifiez les contenus des bannières de la page d’accueil.
        </p>
      </header>

      <section className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">
            Bannière événementielle
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Cette bannière met en avant un événement, avec son image, son titre
            et son commentaire.
          </p>
        </div>

        {isLoading && (
          <p role="status" className="text-sm text-neutral-500">
            Chargement de la bannière…
          </p>
        )}

        {errorMessage && (
          <p role="alert" className="text-sm text-red-600">
            {errorMessage}
          </p>
        )}

        {statusMessage && (
          <p role="status" className="text-sm text-neutral-700">
            {statusMessage}
          </p>
        )}

        <div className="grid gap-8 xl:grid-cols-2">
          <form
            className="space-y-5"
            onSubmit={(event) => event.preventDefault()}
          >
            <div>
              <label
                htmlFor="banner-eyebrow"
                className="mb-2 block text-sm font-medium text-neutral-800"
              >
                Texte introductif
              </label>
              <input
                id="banner-eyebrow"
                value={banner.eyebrow}
                onChange={(event) =>
                  updateField("eyebrow", event.target.value)
                }
                maxLength={80}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-200"
              />
            </div>

            <div>
              <label
                htmlFor="banner-title"
                className="mb-2 block text-sm font-medium text-neutral-800"
              >
                Titre
              </label>
              <textarea
                id="banner-title"
                value={banner.title}
                onChange={(event) =>
                  updateField("title", event.target.value)
                }
                maxLength={180}
                rows={3}
                required
                className="w-full resize-y rounded-lg border border-neutral-300 px-3 py-2.5 outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-200"
              />
            </div>

            <div>
              <label
                htmlFor="banner-description"
                className="mb-2 block text-sm font-medium text-neutral-800"
              >
                Commentaire
              </label>
              <textarea
                id="banner-description"
                value={banner.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                maxLength={600}
                rows={4}
                className="w-full resize-y rounded-lg border border-neutral-300 px-3 py-2.5 outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-200"
              />
              <p className="mt-1 text-xs text-neutral-500">
                {banner.description.length}/600 caractères
              </p>
            </div>

            <div>
              <label
                htmlFor="banner-image"
                className="mb-2 block text-sm font-medium text-neutral-800"
              >
                URL de l’image
              </label>
              <input
                id="banner-image"
                type="url"
                value={banner.image_url}
                onChange={(event) =>
                  updateField("image_url", event.target.value)
                }
                placeholder="https://…"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-200"
              />
              <p className="mt-1 text-xs text-neutral-500">
                La sélection depuis la bibliothèque de médias sera ajoutée
                ensuite.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="banner-button-label"
                  className="mb-2 block text-sm font-medium text-neutral-800"
                >
                  Texte du bouton
                </label>
                <input
                  id="banner-button-label"
                  value={banner.button_label}
                  onChange={(event) =>
                    updateField("button_label", event.target.value)
                  }
                  maxLength={60}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-200"
                />
              </div>

              <div>
                <label
                  htmlFor="banner-button-href"
                  className="mb-2 block text-sm font-medium text-neutral-800"
                >
                  Destination du bouton
                </label>
                <input
                  id="banner-button-href"
                  value={banner.button_href}
                  onChange={(event) =>
                    updateField("button_href", event.target.value)
                  }
                  maxLength={300}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-200"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-neutral-100 p-3 text-sm text-neutral-600">
              <ImageIcon aria-hidden="true" className="size-5 shrink-0" />
              <span>
                Les changements sont visibles dans l’aperçu. Ils ne sont pas
                encore enregistrés en base de données.
              </span>
            </div>
          </form>

          <div className="min-w-0 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
              <Eye aria-hidden="true" className="size-4" />
              Aperçu en direct
            </div>

            <div className="relative isolate flex min-h-[420px] overflow-hidden rounded-xl bg-neutral-950 text-white sm:min-h-[480px]">
              {banner.image_url && (
                <img
                  src={banner.image_url}
                  alt=""
                  className="absolute inset-0 -z-20 h-full w-full object-cover"
                />
              )}

              {!banner.image_url && (
                <div className="absolute inset-0 -z-20 flex items-center justify-center bg-neutral-800">
                  <div className="text-center text-neutral-400">
                    <ImageIcon
                      aria-hidden="true"
                      className="mx-auto size-10"
                    />
                    <p className="mt-2 text-sm">Aucune image sélectionnée</p>
                  </div>
                </div>
              )}


              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-neutral-950 via-neutral-950/85 to-neutral-950/10" />

              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-neutral-950/50 via-transparent to-neutral-950/10" />

              <div className="flex w-full items-center p-6 sm:p-8">
                <div className="max-w-xl">
                  {banner.eyebrow && (
                    <p className="mb-4 text-xs uppercase tracking-[0.25em] text-neutral-300 sm:text-sm">
                      {banner.eyebrow}
                    </p>
                  )}

                  <h3 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                    {banner.title || "Titre de la bannière"}
                  </h3>

                  {banner.description && (
                    <p className="mt-5 max-w-lg whitespace-pre-line text-base leading-relaxed text-neutral-300 sm:text-lg">
                      {banner.description}
                    </p>
                  )}

                  {banner.button_label && (
                    <span className="mt-7 inline-flex rounded-md bg-[var(--color-accent)] px-5 py-3 text-sm font-medium text-white">
                      {banner.button_label}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-neutral-500">
              Aperçu indicatif : le rendu définitif sera vérifié dans le
              carrousel de la page publique.
            </p>
          </div>
        </div>

        <div className="flex justify-end border-t border-neutral-200 pt-5">
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading || isSaving || !banner.title.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save aria-hidden="true" className="size-4" />
            {isSaving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </section>
    </section>
  );
}
*/}