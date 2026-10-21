import { supabase } from "../lib/supabase";

export type ContactMessageStatus = "new" | "read" | "archived";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: ContactMessageStatus;
  created_at: string;
  updated_at: string;
}

export interface NewContactMessage {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export const messagesService = {
  async send(input: NewContactMessage): Promise<void> {
    const { error } = await supabase
      .from("contact_messages")
      .insert({
        name: input.name.trim(),
        email: input.email.trim(),
        phone: input.phone.trim(),
        message: input.message.trim(),
      });

    if (error) {
      console.error("Erreur lors de l'envoi du message :", error);
      throw new Error(
        "Impossible d'envoyer le message. Merci de réessayer."
      );
    }
  },

  async list(
    status?: ContactMessageStatus
  ): Promise<ContactMessage[]> {
    let query = supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error("Impossible de charger les messages.");
    }

    return (data ?? []) as ContactMessage[];
  },

  async setStatus(
    id: string,
    status: ContactMessageStatus
  ): Promise<void> {
    const { error } = await supabase
      .from("contact_messages")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      throw new Error("Impossible de modifier le statut du message.");
    }
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("contact_messages")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error("Impossible de supprimer le message.");
    }
  },
};
