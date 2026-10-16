import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LockKeyhole, LogIn } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const requestedPath = (
    location.state as { from?: { pathname?: string } } | null
  )?.from?.pathname;

  const destination =
    requestedPath?.startsWith("/admin") &&
    requestedPath !== "/admin/login"
      ? requestedPath
      : "/admin";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(
          "Connexion impossible. Vérifie ton adresse e-mail et ton mot de passe."
        );
        return;
      }

      navigate(destination, { replace: true });
    } catch {
      setErrorMessage(
        "Une erreur est survenue. Vérifie ta connexion puis réessaie."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-5 py-12 text-white">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-8 inline-block text-sm text-neutral-400 transition-colors hover:text-white"
        >
          ← Retour au site
        </Link>

        <section className="rounded-2xl border border-white/10 bg-neutral-900 p-7 shadow-2xl sm:p-9">
          <div className="mb-7 flex size-12 items-center justify-center rounded-xl bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
            <LockKeyhole aria-hidden="true" className="size-6" />
          </div>

          <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-400">
            Aïkido Club Dieppois
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Administration
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-neutral-400">
            Connecte-toi pour accéder au mode édition
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="admin-email"
                className="mb-2 block text-sm font-medium"
              >
                Adresse e-mail
              </label>

              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-white/15 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
                placeholder="admin@exemple.fr"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="mb-2 block text-sm font-medium"
              >
                Mot de passe
              </label>

              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-white/15 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
                placeholder="Ton mot de passe"
              />
            </div>

            {errorMessage && (
              <p
                role="alert"
                className="rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300"
              >
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-3 font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogIn aria-hidden="true" className="size-5" />
              {isLoading ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          <p className="mt-6 text-xs leading-relaxed text-neutral-500">
            Accès réservé aux personnes autorisées par le club.
          </p>
        </section>
      </div>
    </main>
  );
}
