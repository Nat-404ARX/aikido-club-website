import { supabase } from "../lib/supabase";

export interface Teacher {
  id: string;
  name: string;
  grade: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type TeacherInput = Pick<
  Teacher,
  "name" | "grade" | "image_url" | "is_active" | "sort_order"
>;

function throwIfError(error: { message: string } | null): void {
  if (error) {
    throw new Error(error.message);
  }
}

export const teachersService = {
  async list(includeInactive = true): Promise<Teacher[]> {
    let query = supabase
      .from("club_teachers")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (!includeInactive) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    throwIfError(error);
    return (data ?? []) as Teacher[];
  },

  async create(input: TeacherInput): Promise<Teacher> {
    const { data, error } = await supabase
      .from("club_teachers")
      .insert({
        name: input.name.trim(),
        grade: input.grade.trim(),
        image_url: input.image_url.trim(),
        is_active: input.is_active,
        sort_order: input.sort_order,
      })
      .select("*")
      .single();

    throwIfError(error);

    if (!data) {
      throw new Error("La fiche du professeur n'a pas été créée.");
    }

    return data as Teacher;
  },

  async update(id: string, input: TeacherInput): Promise<Teacher> {
    const { data, error } = await supabase
      .from("club_teachers")
      .update({
        name: input.name.trim(),
        grade: input.grade.trim(),
        image_url: input.image_url.trim(),
        is_active: input.is_active,
        sort_order: input.sort_order,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    throwIfError(error);

    if (!data) {
      throw new Error("La fiche du professeur est introuvable.");
    }

    return data as Teacher;
  },

  async setActive(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from("club_teachers")
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    throwIfError(error);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("club_teachers")
      .delete()
      .eq("id", id);

    throwIfError(error);
  },
};
