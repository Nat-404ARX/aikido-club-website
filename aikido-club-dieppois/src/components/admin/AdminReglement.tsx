import { useEffect, useState } from "react";
import { Save } from "lucide-react";

import ClubSectionEditor from "./ClubSelectionEditor";
import {
  getReglementAdmin,
  saveReglementInfo,
  saveClubSections,
  type AdminClubSection,
  type ReglementAdminData,
} from "../../services/clubPageService.ts";

const defaultInfo: ReglementAdminData = {
  id: true,
  title: { fr: "", en: "" },
  description: { fr: "", en: "" },
  notice_title: { fr: "", en: "" },
  notice_text: { fr: "", en: "" },
  last_update: { fr: "", en: "" },
};

function LocalizedField({
  label,
  value,
  onChange,
  rows = 2,
}: {
  label: string;
  value: { fr: string; en: string };
  onChange: (value: { fr: string; en: string }) => void;
  rows?: number;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {(["fr", "en"] as const).map((language) => (
        <label key={language} className="block">
          <span className="mb-2 block text-sm font-medium text-neutral-800">
            {label} ({language.toUpperCase()})
          </span>
          <textarea
            rows={rows}
            value={value[language]}
            onChange={(event) =>
              onChange({
                ...value,
                [language]: event.target.value,
              })
            }
            className="w-full resize-y rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-200"
          />
        </label>
      ))}
    </div>
  );
}

export default function AdminReglement() {
  const [info, setInfo] = useState<ReglementAdminData>(defaultInfo);
  const [sections, setSections] = useState<AdminClubSection[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    getReglementAdmin()
      .then((data) => {
        if (!active) return;

        setInfo(data.info);
        setSections(data.sections);
      })
      .catch(() => {
        if (active) {
          setErrorMessage("Impossible de charger le règlement intérieur.");
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function updateInfo<K extends keyof ReglementAdminData>(
    field: K,
    value: ReglementAdminData[K],
  ) {
    setInfo((current) => ({ ...current, [field]: value }));
  }

  function deleteSection(id: string) {
    const confirmed = window.confirm(
      "Supprimer définitivement cette section ?",
    );

    if (!confirmed) return;

    if (!id.startsWith("new-")) {
      setDeletedIds((current) => [...current, id]);
    }

    setSections((current) =>
      current.filter((section) => section.id !== id),
    );
  }

  async function handleSave() {
    setIsSaving(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      await saveReglementInfo(info);

      await saveClubSections(
        "club_reglement_sections",
        sections,
        deletedIds,
      );

      setDeletedIds([]);
      setStatusMessage("Règlement intérieur enregistré avec succès.");

      const data = await getReglementAdmin();
      setInfo(data.info);
      setSections(data.sections);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "Enregistrement impossible. Vérifie la connexion et les autorisations Supabase.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="space-y-8">
      <header>
        <p className="text-sm font-medium text-neutral-500">
          Administration / Pages / Règlement intérieur
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Règlement intérieur
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-500">
          Gérez le règlement intérieur du club, ses traductions et ses différentes
          sections sans modifier le code du site.
        </p>
      </header>

      {errorMessage && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      {statusMessage && (
        <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {statusMessage}
        </p>
      )}

      {isLoading ? (
        <p role="status" className="text-sm text-neutral-500">
          Chargement du règlement…
        </p>
      ) : (
        <>
          <section className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">
                Informations générales
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Ces informations apparaissent dans l'en-tête et dans le bandeau
                d'information de la page publique.
              </p>
            </div>

            <div className="space-y-5">
              <LocalizedField
                label="Titre de la page"
                value={info.title}
                onChange={(value) => updateInfo("title", value)}
              />

              <LocalizedField
                label="Description"
                value={info.description}
                onChange={(value) => updateInfo("description", value)}
                rows={3}
              />
            </div>
          </section>

          <section className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">
                Bandeau d'information
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Le message affiché au-dessus des sections du règlement.
              </p>
            </div>

            <div className="space-y-5">
              <LocalizedField
                label="Titre du bandeau"
                value={info.notice_title}
                onChange={(value) => updateInfo("notice_title", value)}
              />

              <LocalizedField
                label="Texte du bandeau"
                value={info.notice_text}
                onChange={(value) => updateInfo("notice_text", value)}
                rows={4}
              />
            </div>
          </section>

          <section className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">
                Mise à jour
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Texte affiché en bas de la page publique.
              </p>
            </div>

            <LocalizedField
              label="Mention de mise à jour"
              value={info.last_update}
              onChange={(value) => updateInfo("last_update", value)}
            />
          </section>

          <section className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7">
            <ClubSectionEditor
              sections={sections}
              setSections={setSections}
              onDelete={deleteSection}
            />
          </section>

          <div className="flex justify-end border-t border-neutral-200 pt-5">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save aria-hidden="true" className="size-4" />
              {isSaving ? "Enregistrement…" : "Enregistrer le règlement"}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
