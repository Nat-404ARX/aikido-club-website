import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Trash2,
  Users,
  X,
} from "lucide-react";

import MediaPicker from "./MediaPicker.tsx";
import {
  teachersService,
  type Teacher,
  type TeacherInput,
} from "../../services/teacherService.ts";

const emptyForm: TeacherInput = {
  name: "",
  grade: "",
  image_url: "",
  is_active: true,
  sort_order: 0,
};

export default function AdminProfesseurs() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [form, setForm] = useState<TeacherInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [showInactive, setShowInactive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadTeachers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await teachersService.list(true);
      setTeachers(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les professeurs."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTeachers();
  }, [loadTeachers]);

  function openCreateForm() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      sort_order:
        teachers.reduce(
          (max, teacher) => Math.max(max, teacher.sort_order),
          0
        ) + 1,
    });
    setFormOpen(true);
    setError("");
    setNotice("");
  }

  function openEditForm(teacher: Teacher) {
    setEditingId(teacher.id);
    setForm({
      name: teacher.name,
      grade: teacher.grade,
      image_url: teacher.image_url,
      is_active: teacher.is_active,
      sort_order: teacher.sort_order,
    });
    setFormOpen(true);
    setError("");
    setNotice("");
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  }

  function updateField<K extends keyof TeacherInput>(
    field: K,
    value: TeacherInput[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!form.name.trim()) {
      setError("Le nom du professeur est obligatoire.");
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        await teachersService.update(editingId, form);
        setNotice("La fiche du professeur a été mise à jour.");
      } else {
        await teachersService.create(form);
        setNotice("Le professeur a été ajouté.");
      }

      closeForm();
      await loadTeachers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'enregistrer cette fiche."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(teacher: Teacher) {
    setError("");
    setNotice("");

    try {
      await teachersService.setActive(teacher.id, !teacher.is_active);
      setNotice(
        teacher.is_active
          ? `${teacher.name} n'apparaît plus sur le site.`
          : `${teacher.name} apparaît de nouveau sur le site.`
      );
      await loadTeachers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de modifier le statut."
      );
    }
  }

  async function deleteTeacher(teacher: Teacher) {
    const confirmed = window.confirm(
      `Supprimer définitivement la fiche de ${teacher.name} ? Cette action est irréversible.`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await teachersService.delete(teacher.id);
      setNotice(`La fiche de ${teacher.name} a été supprimée.`);
      await loadTeachers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de supprimer cette fiche."
      );
    }
  }

  async function moveTeacher(teacher: Teacher, direction: -1 | 1) {
    const activeTeachers = [...teachers]
      .filter((item) => item.is_active)
      .sort(
        (a, b) =>
          a.sort_order - b.sort_order || a.name.localeCompare(b.name)
      );

    const index = activeTeachers.findIndex(
      (item) => item.id === teacher.id
    );
    const target = activeTeachers[index + direction];

    if (index < 0 || !target) return;

    setError("");
    setNotice("");

    try {
      await Promise.all([
        teachersService.update(teacher.id, {
          name: teacher.name,
          grade: teacher.grade,
          image_url: teacher.image_url,
          is_active: teacher.is_active,
          sort_order: target.sort_order,
        }),
        teachersService.update(target.id, {
          name: target.name,
          grade: target.grade,
          image_url: target.image_url,
          is_active: target.is_active,
          sort_order: teacher.sort_order,
        }),
      ]);

      await loadTeachers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de réorganiser les professeurs."
      );
    }
  }

  const displayedTeachers = teachers.filter(
    (teacher) => showInactive || teacher.is_active
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-neutral-500">
            Administration / Contenus
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
            Professeurs
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600">
            Gérez les enseignants présentés sur la page d’accueil et
            dans les autres sections du site.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          <Plus className="size-4" />
          Ajouter un professeur
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
          {notice}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-neutral-100">
            <Users className="size-5 text-neutral-700" />
          </div>
          <div>
            <p className="font-medium text-neutral-900">
              {teachers.filter((teacher) => teacher.is_active).length} professeur(s) actif(s)
            </p>
            <p className="text-sm text-neutral-500">
              {teachers.length} fiche(s) au total
            </p>
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(event) => setShowInactive(event.target.checked)}
            className="size-4 rounded border-neutral-300 accent-neutral-900"
          />
          Afficher les professeurs désactivés
        </label>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-20 text-sm text-neutral-500">
          <LoaderCircle className="size-5 animate-spin" />
          Chargement des professeurs…
        </div>
      ) : displayedTeachers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
          <Users className="mx-auto size-8 text-neutral-400" />
          <h2 className="mt-4 font-semibold text-neutral-900">
            Aucun professeur à afficher
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Ajoutez une fiche ou modifiez le filtre d’affichage.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {displayedTeachers.map((teacher) => {
            const activeTeachers = teachers
              .filter((item) => item.is_active)
              .sort(
                (a, b) =>
                  a.sort_order - b.sort_order ||
                  a.name.localeCompare(b.name)
              );
            const activeIndex = activeTeachers.findIndex(
              (item) => item.id === teacher.id
            );

            return (
              <article
                key={teacher.id}
                className={`overflow-hidden rounded-xl border bg-white ${teacher.is_active
                    ? "border-neutral-200"
                    : "border-dashed border-neutral-300 opacity-75"
                  }`}
              >
                <div className="relative aspect-[4/3] bg-neutral-100">
                  {teacher.image_url ? (
                    <img
                      src={teacher.image_url}
                      alt={`Portrait de ${teacher.name}`}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <Users className="size-12 text-neutral-300" />
                    </div>
                  )}

                  <span
                    className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-medium ${teacher.is_active
                        ? "bg-white text-neutral-800"
                        : "bg-neutral-800 text-white"
                      }`}
                  >
                    {teacher.is_active ? "Actif" : "Désactivé"}
                  </span>
                </div>

                <div className="space-y-4 p-4">
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-950">
                      {teacher.name}
                    </h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      {teacher.grade || "Grade non renseigné"}
                    </p>
                    <p className="mt-2 text-xs text-neutral-400">
                      Ordre d’affichage : {teacher.sort_order}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-4">
                    <button
                      type="button"
                      onClick={() => openEditForm(teacher)}
                      className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                    >
                      <Pencil className="size-4" />
                      Modifier
                    </button>

                    <button
                      type="button"
                      onClick={() => void toggleActive(teacher)}
                      title={teacher.is_active ? "Désactiver" : "Réactiver"}
                      aria-label={teacher.is_active ? "Désactiver" : "Réactiver"}
                      className="rounded-lg border border-neutral-200 p-2 text-neutral-600 hover:bg-neutral-50"
                    >
                      {teacher.is_active ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>

                    {teacher.is_active && (
                      <>
                        <button
                          type="button"
                          onClick={() => void moveTeacher(teacher, -1)}
                          disabled={activeIndex <= 0}
                          aria-label="Monter le professeur"
                          className="rounded-lg border border-neutral-200 p-2 text-neutral-600 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <ArrowUp className="size-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => void moveTeacher(teacher, 1)}
                          disabled={
                            activeIndex < 0 ||
                            activeIndex === activeTeachers.length - 1
                          }
                          aria-label="Descendre le professeur"
                          className="rounded-lg border border-neutral-200 p-2 text-neutral-600 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <ArrowDown className="size-4" />
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => void deleteTeacher(teacher)}
                      title="Supprimer définitivement"
                      aria-label={`Supprimer ${teacher.name}`}
                      className="ml-auto rounded-lg border border-red-200 p-2 text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:items-center"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) closeForm();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="teacher-form-title"
            className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-neutral-500">
                  Gestion de l’équipe
                </p>
                <h2
                  id="teacher-form-title"
                  className="mt-1 text-2xl font-semibold text-neutral-950"
                >
                  {editingId ? "Modifier le professeur" : "Nouveau professeur"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                aria-label="Fermer"
                className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium text-neutral-700">
                  Nom complet *
                  <input
                    required
                    maxLength={120}
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    className="mt-2 w-full rounded-lg border border-neutral-300 px-3 py-2.5 font-normal outline-none focus:border-neutral-600 focus:ring-2 focus:ring-neutral-200"
                    placeholder="Ex. : Gilles Baglan"
                  />
                </label>

                <label className="block text-sm font-medium text-neutral-700">
                  Grade / fonction
                  <input
                    maxLength={120}
                    value={form.grade}
                    onChange={(event) => updateField("grade", event.target.value)}
                    className="mt-2 w-full rounded-lg border border-neutral-300 px-3 py-2.5 font-normal outline-none focus:border-neutral-600 focus:ring-2 focus:ring-neutral-200"
                    placeholder="Ex. : 5e dan"
                  />
                </label>
              </div>

              <div>
                <p className="text-sm font-medium text-neutral-700">
                  Photo du professeur
                </p>

                <div className="mt-3 flex flex-col gap-4 sm:flex-row">
                  <div className="flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-100">
                    {form.image_url ? (
                      <img
                        src={form.image_url}
                        alt="Aperçu du portrait"
                        className="size-full object-cover"
                      />
                    ) : (
                      <Users className="size-9 text-neutral-300" />
                    )}
                  </div>

                  <div className="flex flex-col items-start gap-3">
                    <MediaPicker
                      initialCategory="club"
                      label="Choisir dans la bibliothèque"
                      onSelect={(media) => updateField("image_url", media.url)}
                    />
                    <p className="max-w-sm text-xs leading-relaxed text-neutral-500">
                      Sélectionnez une image de la bibliothèque de médias.
                      La photo sera affichée sur la fiche publique du professeur.
                    </p>
                    {form.image_url && (
                      <button
                        type="button"
                        onClick={() => updateField("image_url", "")}
                        className="text-sm text-red-700 hover:underline"
                      >
                        Retirer la photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <label className="block text-sm font-medium text-neutral-700">
                Ordre d’affichage
                <input
                  type="number"
                  min={0}
                  max={9999}
                  value={form.sort_order}
                  onChange={(event) =>
                    updateField("sort_order", Number(event.target.value))
                  }
                  className="mt-2 w-full rounded-lg border border-neutral-300 px-3 py-2.5 font-normal outline-none focus:border-neutral-600 focus:ring-2 focus:ring-neutral-200"
                />
                <span className="mt-1 block text-xs font-normal text-neutral-500">
                  Plus le nombre est petit, plus la fiche apparaît tôt.
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 p-4">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(event) =>
                    updateField("is_active", event.target.checked)
                  }
                  className="mt-0.5 size-4 rounded border-neutral-300 accent-neutral-900"
                />
                <span>
                  <span className="block text-sm font-medium text-neutral-900">
                    Professeur actif
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-neutral-500">
                    Si cette option est désactivée, la fiche ne sera plus
                    visible sur le site public.
                  </span>
                </span>
              </label>

              {error && (
                <div
                  role="alert"
                  className="rounded-lg bg-red-50 p-3 text-sm text-red-800"
                >
                  {error}
                </div>
              )}

              <div className="flex flex-col-reverse justify-end gap-3 border-t border-neutral-200 pt-5 sm:flex-row">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : editingId ? (
                    <Save className="size-4" />
                  ) : (
                    <Check className="size-4" />
                  )}
                  {saving ? "Enregistrement…" : "Enregistrer"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
