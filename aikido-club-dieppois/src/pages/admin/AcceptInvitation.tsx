import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function AcceptInvitation() {
  const navigate = useNavigate();

  const [isChecking, setIsChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error || !data.session) {
        setHasSession(false);
      } else {
        setHasSession(true);
      }

      setIsChecking(false);
    }

    void checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      setHasSession(!!session);
      setIsChecking(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setIsSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    navigate("/admin", { replace: true });
  }

  if (isChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
        <p className="text-sm text-neutral-300">
          Vérification de ton invitation…
        </p>
      </main>
    );
  }

  if (!hasSession) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-950 px-6 text-white">
        <h1 className="text-2xl font-semibold">
          Invitation invalide
        </h1>

        <p className="max-w-md text-center text-sm text-neutral-300">
          Ton invitation a peut-être expiré ou a déjà été utilisée.
          Demande à un administrateur de t'envoyer une nouvelle invitation.
        </p>

        <button
          type="button"
          onClick={() => navigate("/admin/login")}
          className="rounded-lg bg-white px-5 py-3 text-sm font-medium text-neutral-950 hover:bg-neutral-200"
        >
          Retour à la connexion
        </button>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 py-12 text-white">
      <section className="w-full max-w-md">
        <div className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Aïkido Club Dieppois
          </p>

          <h1 className="text-3xl font-semibold">
            Bienvenue dans l'équipe.
          </h1>

          <p className="mt-3 text-sm leading-6 text-neutral-400">
            Ton invitation a été acceptée. Choisis maintenant
            un mot de passe pour finaliser la création de ton compte.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              Nouveau mot de passe
            </label>

            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm outline-none transition focus:border-white"
              placeholder="8 caractères minimum"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium"
            >
              Confirmer le mot de passe
            </label>

            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm outline-none transition focus:border-white"
              placeholder="Répète ton mot de passe"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-900 bg-red-950/50 p-3 text-sm text-red-300"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-white px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "Création du compte…"
              : "Finaliser mon inscription"}
          </button>
        </form>
      </section>
    </main>
  );
}
