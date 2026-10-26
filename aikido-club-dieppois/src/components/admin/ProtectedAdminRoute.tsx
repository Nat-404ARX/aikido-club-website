
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";

type AdminRole = "super_admin" | "admin";

interface ProtectedAdminRouteProps {
  requiredRole?: AdminRole;
}

export default function ProtectedAdminRoute({
  requiredRole,
}: ProtectedAdminRouteProps) {
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [role, setRole] = useState<AdminRole | null>(null);
  const [roleUserId, setRoleUserId] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);

  // 1. Vérifier la session Supabase
  useEffect(() => {
    let mounted = true;

    async function checkUser() {
      const { data, error } = await supabase.auth.getUser();

      if (!mounted) return;

      setUserId(error ? null : data.user?.id ?? null);
      setIsLoading(false);
    }

    void checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      setUserId(session?.user?.id ?? null);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 2. Charger le rôle correspondant à cet utilisateur
  useEffect(() => {
    let mounted = true;

    async function checkRole() {
      setRole(null);
      setRoleUserId(null);

      if (!userId) {
        setRoleLoading(false);
        return;
      }

      setRoleLoading(true);

      const { data, error } = await supabase
        .from("admin_profiles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        console.error(
          "Impossible de vérifier le rôle administrateur :",
          error.message
        );
      }

      const validRole =
        !error &&
        (data?.role === "admin" || data?.role === "super_admin");

      setRole(validRole ? data.role as AdminRole : null);
      setRoleUserId(userId);
      setRoleLoading(false);
    }

    void checkRole();

    return () => {
      mounted = false;
    };
  }, [userId]);

  // 3. Attendre la vérification de la session
  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
        <p role="status" className="text-sm text-neutral-300">
          Vérification de la session…
        </p>
      </main>
    );
  }

  // 4. La connexion reste obligatoire
  if (!userId) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // 5. Ne jamais décider avant d'avoir vérifié le rôle
  if (roleLoading || roleUserId !== userId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
        <p role="status" className="text-sm text-neutral-300">
          Vérification des autorisations…
        </p>
      </main>
    );
  }

  // 6. Connecté, mais sans rôle administrateur valide
  if (!role) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-neutral-950 px-6 text-white">
        <h1 className="text-xl font-semibold">
          Accès non autorisé
        </h1>
        <p className="max-w-md text-center text-sm text-neutral-300">
          Ton compte est connecté, mais aucun rôle administrateur
          valide n'a pu être confirmé. Vérifie le profil et les
          autorisations Supabase.
        </p>
        <button
          type="button"
          onClick={() => void supabase.auth.signOut()}
          className="rounded-lg border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-800"
        >
          Se déconnecter
        </button>
      </main>
    );
  }

  // 7. Protection des pages réservées au super-admin
  if (requiredRole === "super_admin" && role !== "super_admin") {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
