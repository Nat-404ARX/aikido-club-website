import { useEffect, useState } from "react";
import { Save } from "lucide-react";

import ClubSectionEditor from "./ClubSelectionEditor";
import {
  getEngagementsAdmin,
  saveEngagementsInfo,
  saveClubSections,
  type AdminClubSection,
  type EngagementsAdminData,
} from "../../services/clubPageService.ts";

const defaultInfo: EngagementsAdminData = {
  id: true,
  title: { fr: "", en: "" },
  description: { fr: "", en: "" },
  introduction: { fr: "", en: "" },
  conclusion_title: { fr: "", en: "" },
  conclusion_text: { fr: "", en: "" },
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

export default function AdminEngagements() {
  const [info, setInfo] = useState<EngagementsAdminData>(defaultInfo);
  const [sections, setSections] = useState<AdminClubSection[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    getEngagementsAdmin()
      .then((data) => {
        if (!active) return;

        setInfo(data.info);
        setSections(data.sections);
      })
      .catch(() => {
        if (active) {
          setErrorMessage("Impossible de charger les engagements.");
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function updateInfo<K extends keyof EngagementsAdminData>(
    field: K,
    value: EngagementsAdminData[K],
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
      await saveEngagementsInfo(info);

      await saveClubSections(
        "club_engagements_sections",
        sections,
        deletedIds,
      );

      setDeletedIds([]);
      setStatusMessage("Les engagements ont été enregistrés avec succès.");

      const data = await getEngagementsAdmin();
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
          Administration / Pages / Engagements
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Nos engagements
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-500">
          Gérez les engagements du club, leurs traductions et leurs différentes
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
          Chargement des engagements…
        </p>
      ) : (
        <>
          <section className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">
                Informations générales
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Le titre et la description affichés dans l'en-tête de la page.
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
                Introduction
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Texte introductif situé avant les cartes des engagements.
              </p>
            </div>

            <LocalizedField
              label="Introduction"
              value={info.introduction}
              onChange={(value) => updateInfo("introduction", value)}
              rows={5}
            />
          </section>

          <section className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">
                Conclusion
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Bloc de conclusion affiché après les différentes sections.
              </p>
            </div>

            <div className="space-y-5">
              <LocalizedField
                label="Titre de conclusion"
                value={info.conclusion_title}
                onChange={(value) => updateInfo("conclusion_title", value)}
              />

              <LocalizedField
                label="Texte de conclusion"
                value={info.conclusion_text}
                onChange={(value) => updateInfo("conclusion_text", value)}
                rows={5}
              />
            </div>
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
              {isSaving ? "Enregistrement…" : "Enregistrer les engagements"}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
