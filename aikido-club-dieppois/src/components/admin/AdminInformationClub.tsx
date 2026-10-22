import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import {
  Check,
  ExternalLink,
  LoaderCircle,
  Save,
  Upload,
} from "lucide-react";

import MediaPicker from "./MediaPicker.tsx";
import {
  clubInformationService,
  defaultClubInformation,
  type ClubInformationInput,
} from "../../services/clubInformationService";
import { refreshClubInformation } from "../../hooks/useClubInformation";

export default function AdminInformationsClub() {
  const [form, setForm] = useState<ClubInformationInput>({
    ...defaultClubInformation,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await clubInformationService.get();
        if (!cancelled) setForm(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Impossible de charger les informations du club."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateField<K extends keyof ClubInformationInput>(
    field: K,
    value: ClubInformationInput[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateAddress(index: number, value: string) {
    setForm((current) => {
      const address = [...current.address];
      address[index] = value;
      return { ...current, address };
    });
  }

  async function handlePdfChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setError("");
    setNotice("");
    setUploadingPdf(true);

    try {
      const url = await clubInformationService.uploadPdf(file);
      updateField("annual_schedule_pdf", url);
      setNotice(
        "PDF envoyé. Enregistre les modifications pour publier le nouveau lien."
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Impossible d'envoyer le PDF."
      );
    } finally {
      setUploadingPdf(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);

    try {
      await clubInformationService.save(form);
      await refreshClubInformation();
      setNotice("Les informations du club ont été enregistrées.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'enregistrer les modifications."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-20 text-sm text-neutral-500">
        <LoaderCircle className="size-5 animate-spin" />
        Chargement des informations…
      </div>
    );
  }

  const inputClass =
    "mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm font-normal text-neutral-900 outline-none focus:border-neutral-600 focus:ring-2 focus:ring-neutral-200";

  function fieldLabel(
    label: string,
    field: keyof ClubInformationInput,
    placeholder = ""
  ) {
    const value = form[field];

    if (typeof value !== "string") return null;

    return (
      <label className="block text-sm font-medium text-neutral-700">
        {label}
        <input
          type="text"
          value={value}
          onChange={(event) =>
            updateField(field, event.target.value as never)
          }
          placeholder={placeholder}
          className={inputClass}
        />
      </label>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-neutral-500">
            Administration / Configuration
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
            Informations du club
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600">
            Modifiez les coordonnées officielles, les liens et les
            documents affichés sur le site.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving || uploadingPdf}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          <Check className="mr-2 inline size-4" />
          {notice}
        </div>
      )}

      <section className="space-y-6 rounded-xl border border-neutral-200 bg-white p-5 sm:p-7">
        <div>
          <h2 className="text-xl font-semibold text-neutral-950">
            Coordonnées et réseaux sociaux
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Ces informations sont susceptibles d’apparaître dans le pied
            de page, la page Contact et les autres sections publiques.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {fieldLabel("Adresse e-mail", "email", "contact@exemple.fr")}
          {fieldLabel("Téléphone affiché", "phone", "06 00 00 00 00")}
          {fieldLabel("Téléphone pour le lien d’appel", "phone_href", "+33600000000")}
          {fieldLabel("Lien Facebook", "facebook", "https://facebook.com/...")}
          {fieldLabel("Lien YouTube", "youtube", "https://youtube.com/@...")}
          {fieldLabel("Lien Instagram", "instagram", "https://instagram.com/...")}
          {fieldLabel("WhatsApp", "whatsapp", "Lien d'invitation ou mention")}
        </div>

        <div className="border-t border-neutral-100 pt-5">
          <h3 className="font-medium text-neutral-900">Adresse du dojo</h3>
          <div className="mt-4 grid gap-4">
            {form.address.map((line, index) => (
              <label
                key={index}
                className="block text-sm font-medium text-neutral-700"
              >
                Ligne {index + 1}
                <input
                  type="text"
                  value={line}
                  onChange={(event) => updateAddress(index, event.target.value)}
                  className={inputClass}
                />
              </label>
            ))}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    address: [...current.address, ""],
                  }))
                }
                className="text-sm font-medium text-neutral-700 underline underline-offset-4"
              >
                Ajouter une ligne d’adresse
              </button>
              {form.address.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      address: current.address.slice(0, -1),
                    }))
                  }
                  className="text-sm font-medium text-red-700 underline underline-offset-4"
                >
                  Retirer la dernière ligne
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-5 border-t border-neutral-100 pt-5">
          {fieldLabel("Lien Google Maps", "maps_url", "https://www.google.com/maps/...")}
          {fieldLabel(
            "Lien d’intégration Google Maps",
            "mini_maps_url",
            "https://www.google.com/maps/embed?..."
          )}
        </div>

        {form.maps_url && (
          <a
            href={form.maps_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700 hover:underline"
          >
            Tester le lien Google Maps
            <ExternalLink className="size-4" />
          </a>
        )}
      </section>

      <section className="space-y-6 rounded-xl border border-neutral-200 bg-white p-5 sm:p-7">
        <div>
          <h2 className="text-xl font-semibold text-neutral-950">
            Planning annuel
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Actualisez ces informations au début de chaque saison.
          </p>
        </div>

        <label className="block max-w-sm text-sm font-medium text-neutral-700">
          Saison
          <input
            type="text"
            value={form.season}
            onChange={(event) => updateField("season", event.target.value)}
            placeholder="2026-2027"
            className={inputClass}
          />
        </label>

        <div className="space-y-3">
          <p className="text-sm font-medium text-neutral-700">
            Image du planning annuel
          </p>

          {form.annual_schedule_image && (
            <img
              src={form.annual_schedule_image}
              alt="Aperçu du planning annuel"
              className="max-h-80 w-full rounded-xl border border-neutral-200 object-contain object-left"
            />
          )}

          <MediaPicker
            initialCategory="club"
            label="Choisir l’image du planning"
            onSelect={(media) =>
              updateField("annual_schedule_image", media.url)
            }
          />

          {form.annual_schedule_image && (
            <button
              type="button"
              onClick={() => updateField("annual_schedule_image", "")}
              className="text-sm text-red-700 hover:underline"
            >
              Retirer l’image du planning
            </button>
          )}
        </div>

        <div className="space-y-3 border-t border-neutral-100 pt-5">
          <h3 className="font-medium text-neutral-900">
            Document PDF du planning
          </h3>

          {form.annual_schedule_pdf && (
            <a
              href={form.annual_schedule_pdf}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700 underline underline-offset-4"
            >
              Consulter le PDF actuel
              <ExternalLink className="size-4" />
            </a>
          )}

          <label className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-neutral-300 px-4 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50">
            {uploadingPdf ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            {uploadingPdf ? "Envoi du PDF…" : "Importer un nouveau PDF"}
            <input
              type="file"
              accept="application/pdf,.pdf"
              disabled={uploadingPdf}
              onChange={handlePdfChange}
              className="sr-only"
            />
          </label>

          <p className="text-xs leading-relaxed text-neutral-500">
            PDF de 10 Mo maximum. Après l’importation, clique sur
            « Enregistrer » pour publier le nouveau lien sur le site.
            L’ancien fichier reste dans le stockage jusqu’à sa suppression.
          </p>

          {form.annual_schedule_pdf && (
            <button
              type="button"
              onClick={() => updateField("annual_schedule_pdf", "")}
              className="text-sm text-red-700 hover:underline"
            >
              Retirer le lien du PDF
            </button>
          )}
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving || uploadingPdf}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {saving ? "Enregistrement…" : "Enregistrer les modifications"}
        </button>
      </div>
    </form>
  );
}
