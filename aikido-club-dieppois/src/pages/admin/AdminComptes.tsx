
import { useCallback, useEffect, useState } from "react";
import {
  ShieldCheck,
  UserRound,
  UserPlus,
  RefreshCw,
  Shield,
  Trash2,
  Mail,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  adminUsersService,
  type AdminRole,
  type AdminUser,
} from "../../services/admin/adminUsersService.ts";

export default function AdminComptes() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState<AdminRole>("admin");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadAdmins = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = await adminUsersService.list();
      setAdmins(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les administrateurs."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAdmins();
  }, [loadAdmins]);

  async function handleInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Saisis une adresse e-mail.");
      return;
    }

    setIsSubmitting(true);

    try {
      await adminUsersService.invite(normalizedEmail, newRole);
      setEmail("");
      setNewRole("admin");
      setSuccess(
        "L'accès administrateur a été attribué. Si le compte devait être créé, une invitation a été envoyée."
      );
      await loadAdmins();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'ajouter cet administrateur."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRoleChange(
    admin: AdminUser,
    role: AdminRole
  ) {
    if (admin.role === role) return;

    const confirmed = window.confirm(
      `Modifier le rôle de ${admin.email} en ${role === "super_admin" ? "super-administrateur" : "administrateur"
      } ?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await adminUsersService.setRole(admin.userId, role);
      setSuccess("Le rôle a été mis à jour.");
      await loadAdmins();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "La modification a échoué."
      );
    }
  }

  async function handleRevoke(admin: AdminUser) {
    const confirmed = window.confirm(
      `Révoquer l'accès administrateur de ${admin.email} ?\n\nSon compte Supabase ne sera pas supprimé.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await adminUsersService.revoke(admin.userId);
      setSuccess("L'accès administrateur a été révoqué.");
      await loadAdmins();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "La révocation a échoué."
      );
    }
  }

  const superAdminCount = admins.filter(
    (admin) => admin.role === "super_admin"
  ).length;

  return (
    <main className="min-h-screen bg-[#f5f3ee] px-5 py-8 text-neutral-900 md:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Administration / Sécurité
            </p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Administrateurs
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
              Gère les accès au back-office et les niveaux d'autorisation
              des personnes qui administrent le site.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadAdmins()}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-neutral-300 px-4 py-3 text-sm font-medium transition hover:bg-white disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw
              size={16}
              className={isLoading ? "animate-spin" : ""}
            />
            Actualiser
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
            <p>{success}</p>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={<ShieldCheck size={20} />}
            label="Super-Administrateurs"
            value={superAdminCount}
          />
          <StatCard
            icon={<Shield size={20} />}
            label="Administrateurs"
            value={admins.length - superAdminCount}
          />
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:p-7">
          <div className="mb-6 flex items-start gap-3">
            <div className="rounded-xl bg-neutral-100 p-3">
              <UserPlus size={21} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Ajouter un administrateur</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Attribue un accès à un compte existant ou invite une nouvelle personne.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleInvite}
            className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_auto] md:items-end"
          >
            <label className="block">
              <span className="mb-2 block text-sm font-medium">
                Adresse e-mail
              </span>
              <span className="flex items-center gap-2 rounded-xl border border-neutral-300 px-3 focus-within:border-neutral-700">
                <Mail size={17} className="shrink-0 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nom@exemple.fr"
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium">Rôle</span>
              <select
                value={newRole}
                onChange={(event) =>
                  setNewRole(event.target.value as AdminRole)
                }
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm outline-none focus:border-neutral-700"
              >
                <option value="admin">Administrateur</option>
                <option value="super_admin">Super-administrateur</option>
              </select>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Traitement…" : "Ajouter"}
            </button>
          </form>

          <p className="mt-4 text-xs leading-5 text-neutral-500">
            Un compte invité devra suivre le processus d'invitation Supabase.
            Attribue le rôle super-admin uniquement aux personnes de confiance.
          </p>
        </section>

        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-5 py-5 md:px-7">
            <h2 className="text-lg font-semibold">Comptes autorisés</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Seuls les comptes disposant d'un profil administrateur apparaissent ici.
            </p>
          </div>

          {isLoading ? (
            <div className="p-10 text-center text-sm text-neutral-500">
              Chargement des administrateurs…
            </div>
          ) : admins.length === 0 ? (
            <div className="p-10 text-center text-sm text-neutral-500">
              Aucun administrateur trouvé.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="px-6 py-4 font-medium">Compte</th>
                    <th className="px-6 py-4 font-medium">Rôle</th>
                    <th className="px-6 py-4 font-medium">Depuis le</th>
                    <th className="px-6 py-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {admins.map((admin) => (
                    <tr key={admin.userId} className="hover:bg-neutral-50/70">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                            {admin.role === "super_admin" ? (
                              <ShieldCheck size={19} />
                            ) : (
                              <UserRound size={19} />
                            )}
                          </div>
                          <span className="font-medium text-neutral-900">
                            {admin.email}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${admin.role === "super_admin"
                              ? "bg-neutral-900 text-white"
                              : "bg-neutral-100 text-neutral-700"
                            }`}
                        >
                          {admin.role === "super_admin"
                            ? "Super-admin"
                            : "Admin"}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-neutral-500">
                        {new Date(admin.createdAt).toLocaleDateString("fr-FR")}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            aria-label={`Modifier le rôle de ${admin.email}`}
                            value={admin.role}
                            onChange={(event) =>
                              void handleRoleChange(
                                admin,
                                event.target.value as AdminRole
                              )
                            }
                            className="max-w-[170px] rounded-lg border border-neutral-200 bg-white px-2 py-2 text-xs"
                          >
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super-admin</option>
                          </select>

                          <button
                            type="button"
                            aria-label={`Révoquer l'accès de ${admin.email}`}
                            title="Révoquer l'accès"
                            onClick={() => void handleRevoke(admin)}
                            className="rounded-lg border border-neutral-200 p-2 text-neutral-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 inline-flex rounded-xl bg-neutral-100 p-3">
        {icon}
      </div>
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
