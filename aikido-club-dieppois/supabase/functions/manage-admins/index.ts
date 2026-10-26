import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type AdminRole = "super_admin" | "admin";

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function jsonResponse(
  body: unknown,
  status = 200
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function isRole(value: unknown): value is AdminRole {
  return value === "admin" || value === "super_admin";
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return response({ error: "Méthode non autorisée." }, 405);
  }

  const authorization = req.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return response({ error: "Authentification requise." }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return response({ error: "Configuration serveur incomplète." }, 500);
  }

  const token = authorization.slice("Bearer ".length);

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data: authData, error: authError } =
    await authClient.auth.getUser(token);

  if (authError || !authData.user) {
    return response({ error: "Session invalide ou expirée." }, 401);
  }

  const actorId = authData.user.id;

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  // Le rôle est vérifié côté serveur, jamais depuis le navigateur.
  const { data: actorProfile, error: actorError } = await adminClient
    .from("admin_profiles")
    .select("role")
    .eq("user_id", actorId)
    .maybeSingle();

  if (
    actorError ||
    actorProfile?.role !== "super_admin"
  ) {
    return jsonResponse(
      { error: "Accès refusé" },
      403
    );
  }

  let body: {
    action?: string;
    email?: string;
    role?: AdminRole;
    userId?: string;
  };

  try {
    body = await req.json();
  } catch {
    return response({ error: "Corps de requête invalide." }, 400);
  }

  async function findAuthUser(userId: string) {
    // La pagination évite de supposer que tous les utilisateurs
    // tiennent dans une seule réponse listUsers().
    for (let page = 1; page <= 100; page += 1) {
      const { data, error } = await adminClient.auth.admin.listUsers({
        page,
        perPage: 1000,
      });

      if (error) throw error;

      const user = data.users.find((item) => item.id === userId);
      if (user) return user;
      if (data.users.length < 1000) break;
    }

    return null;
  }

  async function findAuthUserByEmail(email: string) {
    for (let page = 1; page <= 100; page += 1) {
      const { data, error } = await adminClient.auth.admin.listUsers({
        page,
        perPage: 1000,
      });

      if (error) throw error;

      const user = data.users.find(
        (item) => item.email?.toLowerCase() === email
      );

      if (user) return user;
      if (data.users.length < 1000) break;
    }

    return null;
  }

  async function getSuperAdminCount() {
    const { count, error } = await adminClient
      .from("admin_profiles")
      .select("user_id", { count: "exact", head: true })
      .eq("role", "super_admin");

    if (error) throw error;

    return count ?? 0;
  }

  async function getAdmin(userId: string) {
    const { data: profile, error } = await adminClient
      .from("admin_profiles")
      .select("user_id, role, created_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    if (!profile) return null;

    const user = await findAuthUser(userId);
    if (!user) return null;

    return {
      userId: profile.user_id,
      email: user.email ?? "",
      role: profile.role as AdminRole,
      createdAt: profile.created_at,
    };
  }

  try {
    switch (body.action) {
      case "list": {
        const { data: profiles, error } = await adminClient
          .from("admin_profiles")
          .select("user_id, role, created_at")
          .order("created_at", { ascending: true });

        if (error) throw error;

        const users = await Promise.all(
          (profiles ?? []).map(async (profile) => {
            const user = await findAuthUser(profile.user_id);

            if (!user) return null;

            return {
              userId: profile.user_id,
              email: user.email ?? "",
              role: profile.role as AdminRole,
              createdAt: profile.created_at,
            };
          })
        );

        return response({
          data: users.filter((user) => user !== null),
        });
      }

      case "invite": {
        const email = body.email?.trim().toLowerCase();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return response({ error: "Adresse e-mail invalide." }, 400);
        }

        if (!isRole(body.role)) {
          return response({ error: "Rôle invalide." }, 400);
        }

        const existingUser = await findAuthUserByEmail(email);

        let userId: string;

        if (existingUser) {
          userId = existingUser.id;
        } else {
          const { data, error } =
            await adminClient.auth.admin.inviteUserByEmail(email);

          if (error) throw error;
          if (!data.user) throw new Error("L'invitation n'a créé aucun utilisateur.");

          userId = data.user.id;
        }

        const { data: existingProfile, error: profileError } =
          await adminClient
            .from("admin_profiles")
            .select("user_id")
            .eq("user_id", userId)
            .maybeSingle();

        if (profileError) throw profileError;

        if (existingProfile) {
          return response({
            error: "Ce compte possède déjà un accès administrateur.",
          }, 409);
        }

        const { error: insertError } = await adminClient
          .from("admin_profiles")
          .insert({ user_id: userId, role: body.role });

        if (insertError) throw insertError;

        const admin = await getAdmin(userId);

        return response({ data: admin }, 201);
      }

      case "set_role": {
        const userId = body.userId;

        if (!userId || !isRole(body.role)) {
          return response({ error: "Utilisateur ou rôle invalide." }, 400);
        }

        if (userId === actorId) {
          return response({
            error: "Tu ne peux pas modifier ton propre rôle ici.",
          }, 400);
        }

        const { data: target, error: targetError } = await adminClient
          .from("admin_profiles")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle();

        if (targetError) throw targetError;
        if (!target) {
          return response({ error: "Profil administrateur introuvable." }, 404);
        }

        if (
          target.role === "super_admin" &&
          body.role !== "super_admin" &&
          (await getSuperAdminCount()) <= 1
        ) {
          return response({
            error: "Impossible de rétrograder le dernier super-administrateur.",
          }, 409);
        }

        const { error } = await adminClient
          .from("admin_profiles")
          .update({ role: body.role })
          .eq("user_id", userId);

        if (error) throw error;

        return response({ data: await getAdmin(userId) });
      }

      case "revoke": {
        const userId = body.userId;

        if (!userId) {
          return response({ error: "Identifiant utilisateur manquant." }, 400);
        }

        if (userId === actorId) {
          return response({
            error: "Tu ne peux pas révoquer ton propre accès.",
          }, 400);
        }

        const { data: target, error: targetError } = await adminClient
          .from("admin_profiles")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle();

        if (targetError) throw targetError;
        if (!target) {
          return response({ error: "Profil administrateur introuvable." }, 404);
        }

        if (
          target.role === "super_admin" &&
          (await getSuperAdminCount()) <= 1
        ) {
          return response({
            error: "Impossible de révoquer le dernier super-administrateur.",
          }, 409);
        }

        const { error } = await adminClient
          .from("admin_profiles")
          .delete()
          .eq("user_id", userId);

        if (error) throw error;

        // Le compte Auth est conservé. Seul l'accès admin est révoqué.
        return response({ data: { userId } });
      }

      default:
        return response({ error: "Action inconnue." }, 400);
    }
  } catch (error) {
    console.error("[manage-admins]", error);
    return response({
      error: "Une erreur serveur est survenue pendant l'opération.",
    }, 500);
  }
});
