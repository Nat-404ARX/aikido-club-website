import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Camera,
  ClipboardList,
  GraduationCap,
  HandHeart,
  Handshake,
  HeartHandshake,
  Leaf,
  Plus,
  Scale,
  ShieldCheck,
  Shirt,
  Trash2,
  UserRound,
  Users,
  Venus,
  type LucideIcon,
} from "lucide-react";

import type {
  AdminClubSection,
  LocalizedContent,
  LocalizedText,
} from "../../services/clubPageService.ts";

const availableIcons: Record<string, LucideIcon> = {
  BookOpen,
  Camera,
  ClipboardList,
  GraduationCap,
  HandHeart,
  Handshake,
  HeartHandshake,
  Leaf,
  Scale,
  ShieldCheck,
  Shirt,
  UserRound,
  Users,
  Venus,
};

type Props = {
  sections: AdminClubSection[];
  setSections: React.Dispatch<React.SetStateAction<AdminClubSection[]>>;
  onDelete: (id: string) => void;
};

function Field({
  label,
  value,
  onChange,
  rows = 2,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-neutral-700">
        {label}
      </span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-y rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-200"
      />
    </label>
  );
}


function LocalizedFields({
  value,
  onChange,
  label,
  multiline = false,
}: {
  value: LocalizedText;
  onChange: (value: LocalizedText) => void;
  label: string;
  multiline?: boolean;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {(["fr", "en"] as const).map((language) => (
        <label key={language} className="block">
          <span className="mb-1.5 block text-sm font-medium text-neutral-700">
            {label} ({language.toUpperCase()})
          </span>

          {multiline ? (
            <textarea
              value={value[language]}
              rows={3}
              onChange={(event) =>
                onChange({ ...value, [language]: event.target.value })
              }
              className="w-full resize-y rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-200"
            />
          ) : (
            <input
              value={value[language]}
              onChange={(event) =>
                onChange({ ...value, [language]: event.target.value })
              }
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-200"
            />
          )}
        </label>
      ))}
    </div>
  );
}

export default function ClubSectionEditor({
  sections,
  setSections,
  onDelete,
}: Props) {
  function updateSection(
    id: string,
    changes: Partial<AdminClubSection>,
  ) {
    setSections((current) =>
      current.map((section) =>
        section.id === id ? { ...section, ...changes } : section,
      ),
    );
  }

  function addSection() {
    const id = `new-${crypto.randomUUID()}`;

    const newSection: AdminClubSection = {
      id,
      section_key: `section-${crypto.randomUUID()}`,
      icon: "BookOpen",
      title: { fr: "", en: "" },
      content: { fr: [""], en: [""] },
      position: sections.length,
      is_active: true,
    };

    setSections((current) => [...current, newSection]);
  }

  function moveSection(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= sections.length) return;

    setSections((current) => {
      const updated = [...current];
      [updated[index], updated[targetIndex]] = [
        updated[targetIndex],
        updated[index],
      ];
      return updated;
    });
  }

  function updateContent(
    section: AdminClubSection,
    language: "fr" | "en",
    value: string,
  ) {
    const paragraphs = value.split("\n\n");

    updateSection(section.id, {
      content: {
        ...section.content,
        [language]: paragraphs,
      } as LocalizedContent,
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">
            Sections de la page
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Gérez les contenus, leur visibilité et leur ordre d'affichage.
          </p>
        </div>

        <button
          type="button"
          onClick={addSection}
          className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700"
        >
          <Plus className="size-4" />
          Ajouter une section
        </button>
      </div>

      {sections.length === 0 && (
        <p className="rounded-lg bg-neutral-50 p-5 text-sm text-neutral-500">
          Aucune section. Ajoutez-en une pour commencer.
        </p>
      )}

      {sections.map((section, index) => {
        const Icon = availableIcons[section.icon] ?? BookOpen;

        return (
          <article
            key={section.id}
            className="space-y-5 rounded-xl border border-neutral-200 p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
                  <Icon className="size-5" />
                </div>

                <div className="min-w-0">
                  <h3 className="font-semibold text-neutral-900">
                    {section.title.fr || `Nouvelle section ${index + 1}`}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Position {index + 1}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveSection(index, -1)}
                  disabled={index === 0}
                  aria-label="Déplacer vers le haut"
                  className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
                >
                  <ArrowUp className="size-4" />
                </button>

                <button
                  type="button"
                  onClick={() => moveSection(index, 1)}
                  disabled={index === sections.length - 1}
                  aria-label="Déplacer vers le bas"
                  className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
                >
                  <ArrowDown className="size-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(section.id)}
                  aria-label="Supprimer la section"
                  className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-neutral-50 p-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  checked={section.is_active}
                  onChange={(event) =>
                    updateSection(section.id, {
                      is_active: event.target.checked,
                    })
                  }
                  className="size-4 accent-neutral-900"
                />
                Section visible sur le site
              </label>

              <label className="flex items-center gap-2 text-sm text-neutral-700">
                Icône
                <select
                  value={section.icon}
                  onChange={(event) =>
                    updateSection(section.id, { icon: event.target.value })
                  }
                  className="rounded-lg border border-neutral-300 bg-white px-2 py-1.5"
                >
                  {Object.keys(availableIcons).map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <LocalizedFields
              label="Titre"
              value={section.title}
              onChange={(title) => updateSection(section.id, { title })}
            />

            <div className="space-y-4">
              <Field
                label="Paragraphes (FR)"
                value={section.content.fr.join("\n\n")}
                rows={5}
                onChange={(value) => updateContent(section, "fr", value)}
              />

              <Field
                label="Paragraphes (EN)"
                value={section.content.en.join("\n\n")}
                rows={5}
                onChange={(value) => updateContent(section, "en", value)}
              />

              <p className="text-xs text-neutral-500">
                Séparez les paragraphes par une ligne vide.
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
