import { supabase } from "../../lib/supabase";

export type AdminRole = "super_admin" | "admin";

export interface AdminUser {
  userId: string;
  email: string;
  role: AdminRole;
  createdAt: string;
}

type AdminAction =
  | { action: "list" }
  | { action: "invite"; email: string; role: AdminRole }
  | { action: "set_role"; userId: string; role: AdminRole }
  | { action: "revoke"; userId: string };

interface AdminResponse<T> {
  data?: T;
  error?: string;
}

async function callAdminFunction<T>(
  payload: AdminAction
): Promise<T> {
  const { data, error } = await supabase.functions.invoke<
    AdminResponse<T>
  >("manage-admins", {
    body: payload,
  });

  if (error) {
    throw new Error(
      error.message || "Impossible de contacter le service administrateur."
    );
  }

  if (!data || data.error) {
    throw new Error(
      data?.error || "Une erreur est survenue."
    );
  }

  return data.data as T;
}

export const adminUsersService = {
  list(): Promise<AdminUser[]> {
    return callAdminFunction<AdminUser[]>({
      action: "list",
    });
  },

  invite(email: string, role: AdminRole): Promise<AdminUser> {
    return callAdminFunction<AdminUser>({
      action: "invite",
      email,
      role,
    });
  },

  setRole(
    userId: string,
    role: AdminRole
  ): Promise<AdminUser> {
    return callAdminFunction<AdminUser>({
      action: "set_role",
      userId,
      role,
    });
  },

  revoke(userId: string): Promise<{ userId: string }> {
    return callAdminFunction<{ userId: string }>({
      action: "revoke",
      userId,
    });
  },
};
