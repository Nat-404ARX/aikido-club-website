import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import {
  Check,
  ExternalLink,
  LoaderCircle,
  Save,
  Upload,
} from "lucide-react";

import {
  defaultPricing,
  pricingService,
  type PricingData,
} from "../../services/princingService.ts";

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
  const [pricing, setPricing] = useState<PricingData>(defaultPricing);
  const [pricingSaving, setPricingSaving] = useState(false);
  const [pricingMessage, setPricingMessage] = useState("");

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

  useEffect(() => {
    pricingService
      .get()
      .then(setPricing)
      .catch((error: unknown) => {
        console.error("Erreur de chargement des tarifs :", error);
        setPricingMessage("Impossible de charger les tarifs.");
      });
  }, []);

  const updatePlan = (
    key: "adult" | "child",
    field: "price" | "description",
    value: number | null | string
  ) => {
    setPricing((current) => ({
      ...current,
      plans: current.plans.map((plan) =>
        plan.key === key
          ? { ...plan, [field]: value }
          : plan
      ),
    }));
  };

  const savePricing = async () => {
    setPricingSaving(true);
    setPricingMessage("");

    try {
      await pricingService.save(pricing);
      setPricingMessage("Tarifs enregistrés avec succès.");
    } catch (error) {
      console.error(error);
      setPricingMessage("Erreur lors de l'enregistrement des tarifs.");
    } finally {
      setPricingSaving(false);
    }
  };

  const uploadPricingPdf = async (file: File) => {
    setPricingMessage("");

    try {
      const url = await pricingService.uploadPdf(file);

      setPricing((current) => ({
        ...current,
        pdf_url: url,
      }));

      setPricingMessage(
        "PDF chargé. Enregistre les tarifs pour confirmer le nouveau lien."
      );
    } catch (error) {
      console.error(error);
      setPricingMessage("Impossible de téléverser le PDF.");
    }
  };

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


      {/* Mentions légales */}
      <section className="space-y-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">
            Mentions légales
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Informations juridiques de l’association et de l’hébergement.
            Les valeurs à confirmer pourront être corrigées ici.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-medium text-neutral-700">
            Type de structure
            <input
              type="text"
              value={form.legal_association_type}
              onChange={(event) => updateField("legal_association_type", event.target.value)}
              placeholder="Association sportive"
              className={inputClass}
            />
          </label>

          <label className="block text-sm font-medium text-neutral-700">
            Numéro de club
            <input
              type="text"
              value={form.legal_club_number}
              onChange={(event) => updateField("legal_club_number", event.target.value)}
              placeholder="0X XX XX XX XX"
              className={inputClass}
            />
          </label>

          <label className="block text-sm font-medium text-neutral-700">
            Discipline
            <input
              type="text"
              value={form.legal_discipline}
              onChange={(event) => updateField("legal_discipline", event.target.value)}
              placeholder="Aïkido"
              className={inputClass}
            />
          </label>

          <label className="block text-sm font-medium text-neutral-700">
            Nom de l’association / objet social
            <input
              type="text"
              value={form.legal_social_object}
              onChange={(event) => updateField("legal_social_object", event.target.value)}
              placeholder="Aïkido Club Dieppois"
              className={inputClass}
            />
          </label>

          <label className="block text-sm font-medium text-neutral-700 sm:col-span-2">
            Président de l’association
            <input
              type="text"
              value={form.legal_president_name}
              onChange={(event) => updateField("legal_president_name", event.target.value)}
              placeholder=""
              className={inputClass}
            />
          </label>

          <label className="block text-sm font-medium text-neutral-700 sm:col-span-2">
            Adresse du lieu de pratique
            <textarea
              rows={3}
              value={form.legal_practice_address}
              onChange={(event) => updateField("legal_practice_address", event.target.value)}
              placeholder={""}
              className={inputClass}
            />
          </label>

          <label className="block text-sm font-medium text-neutral-700 sm:col-span-2">
            Adresse du siège social
            <textarea
              rows={3}
              value={form.legal_registered_office}
              onChange={(event) => updateField("legal_registered_office", event.target.value)}
              placeholder={""}
              className={inputClass}
            />
          </label>

          <label className="block text-sm font-medium text-neutral-700 sm:col-span-2">
            Directeur de la publication
            <input
              type="text"
              value={form.legal_publication_director}
              onChange={(event) => updateField("legal_publication_director", event.target.value)}
              placeholder=""
              className={inputClass}
            />
          </label>
        </div>

        <div className="border-t border-neutral-200 pt-5">
          <h3 className="mb-4 font-semibold text-neutral-900">
            Hébergement du site
          </h3>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium text-neutral-700">
              Nom de l’hébergeur
              <input
                type="text"
                value={form.legal_host_name}
                onChange={(event) => updateField("legal_host_name", event.target.value)}
                placeholder=""
                className={inputClass}
              />
            </label>

            <label className="block text-sm font-medium text-neutral-700">
              Raison sociale
              <input
                type="text"
                value={form.legal_host_company}
                onChange={(event) => updateField("legal_host_company", event.target.value)}
                placeholder=""
                className={inputClass}
              />
            </label>

            <label className="block text-sm font-medium text-neutral-700 sm:col-span-2">
              Adresse de l’hébergeur
              <textarea
                rows={2}
                value={form.legal_host_address}
                onChange={(event) => updateField("legal_host_address", event.target.value)}
                placeholder=""
                className={inputClass}
              />
            </label>

            <label className="block text-sm font-medium text-neutral-700 sm:col-span-2">
              Coordonnées de l’hébergeur
              <input
                type="text"
                value={form.legal_host_contact}
                onChange={(event) => updateField("legal_host_contact", event.target.value)}
                placeholder="Téléphone, e-mail ou autre contact officiel"
                className={inputClass}
              />
            </label>
          </div>
        </div>

        <div className="border-t border-neutral-200 pt-5">
          <label className="block text-sm font-medium text-neutral-700">
            URL du site partenaire
            <input
              type="url"
              value={form.legal_partner_url}
              onChange={(event) => updateField("legal_partner_url", event.target.value)}
              placeholder="https://www.exemple.fr"
              className={inputClass}
            />
          </label>
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


      <section className="space-y-6 rounded-xl border border-neutral-200 p-6">
        <div>
          <h2 className="text-xl font-semibold">Tarifs et cotisations</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Modifie les prix, la saison et le document PDF public.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Saison
          </label>
          <input
            type="text"
            value={pricing.season}
            onChange={(e) =>
              setPricing((current) => ({
                ...current,
                season: e.target.value,
              }))
            }
            placeholder="2026-2027"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </div>

        {pricing.plans.map((plan) => (
          <div
            key={plan.key}
            className="grid gap-4 rounded-lg border border-neutral-200 p-4 md:grid-cols-2"
          >
            <div>
              <h3 className="font-medium">
                {plan.key === "adult" ? "Adultes" : "Enfants"}
              </h3>

              <label className="mb-1 mt-3 block text-sm">
                Tarif annuel (€)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={plan.price ?? ""}
                onChange={(e) =>
                  updatePlan(
                    plan.key,
                    "price",
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
                className="w-full rounded-lg border border-neutral-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm">
                Description
              </label>
              <textarea
                value={plan.description}
                onChange={(e) =>
                  updatePlan(plan.key, "description", e.target.value)
                }
                rows={3}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2"
              />
            </div>
          </div>
        ))}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Document PDF des tarifs
          </label>

          {pricing.pdf_url && (
            <p className="mb-2 break-all text-sm">
              Document actuel :{" "}
              <a
                href={pricing.pdf_url}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Consulter le PDF
              </a>
            </p>
          )}

          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadPricingPdf(file);
              e.currentTarget.value = "";
            }}
            className="block w-full text-sm rounded-lg outline border-black"
          />
        </div>

        {pricingMessage && (
          <p role="status" className="text-sm">
            {pricingMessage}
          </p>
        )}

        <button
          type="button"
          onClick={() => void savePricing()}
          disabled={pricingSaving}
          className="rounded-lg bg-neutral-900 px-5 py-3 text-white disabled:opacity-50"
        >
          {pricingSaving ? "Enregistrement..." : "Enregistrer les tarifs"}
        </button>
      </section>

    </form>
  );
}
