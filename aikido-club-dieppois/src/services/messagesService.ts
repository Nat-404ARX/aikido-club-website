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
  website?: string;
}

export type ContactMessageCounts = Record<ContactMessageStatus, number>;

export const MESSAGE_LIMITS = { name: 100, email: 254, phone: 30, message: 5000 } as const;

const COOLDOWN_MS = 30_000;
const LAST_SENT_KEY = "contact:last-sent";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[0-9+().\s-]{6,30}$/;

function validate(input: NewContactMessage): NewContactMessage {
  const clean = {
    name: input.name.trim().replace(/\s+/g, " "),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    message: input.message.trim(),
  };

  if (clean.name.length < 2 || clean.name.length > MESSAGE_LIMITS.name)
    throw new Error("Merci d'indiquer votre nom.");
  if (!EMAIL_RE.test(clean.email) || clean.email.length > MESSAGE_LIMITS.email)
    throw new Error("L'adresse e-mail semble invalide.");
  if (clean.phone && !PHONE_RE.test(clean.phone))
    throw new Error("Le numéro de téléphone semble invalide.");
  if (clean.message.length < 10)
    throw new Error("Votre message est un peu court : dites-nous-en un peu plus.");
  if (clean.message.length > MESSAGE_LIMITS.message)
    throw new Error(`Votre message est trop long (${MESSAGE_LIMITS.message} caractères maximum).`);

  return clean as NewContactMessage;
}

function checkCooldown() {
  try {
    const last = Number(localStorage.getItem(LAST_SENT_KEY) ?? 0);
    const wait = COOLDOWN_MS - (Date.now() - last);
    if (wait > 0) throw new Error(`Merci de patienter ${Math.ceil(wait / 1000)} s avant d'envoyer un nouveau message.`);
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("Merci de patienter")) throw e;
  }
}

export const messagesService = {
  async send(input: NewContactMessage): Promise<void> {
    if (input.website?.trim()) return;

    const clean = validate(input);
    checkCooldown();

    const { error } = await supabase.from("contact_messages").insert({
      name: clean.name,
      email: clean.email,
      phone: clean.phone,
      message: clean.message,
    });

    if (error) {
      console.error("Erreur lors de l'envoi du message :", error);
      throw new Error("Impossible d'envoyer le message. Merci de réessayer.");
    }

    try { localStorage.setItem(LAST_SENT_KEY, String(Date.now())); } catch { /* ignoré */ }
  },

  async list(status?: ContactMessageStatus): Promise<ContactMessage[]> {
    let query = supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw new Error("Impossible de charger les messages.");
    return (data ?? []) as ContactMessage[];
  },

  async latest(limit = 5, status?: ContactMessageStatus): Promise<ContactMessage[]> {
    let query = supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(limit);
    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw new Error("Impossible de charger les messages.");
    return (data ?? []) as ContactMessage[];
  },


  async counts(): Promise<ContactMessageCounts> {
    const count = async (status: ContactMessageStatus) => {
      const { count, error } = await supabase
        .from("contact_messages")
        .select("id", { count: "exact", head: true })
        .eq("status", status);
      if (error) throw new Error("Impossible de compter les messages.");
      return count ?? 0;
    };
    const [n, r, a] = await Promise.all([count("new"), count("read"), count("archived")]);
    return { new: n, read: r, archived: a };
  },

  async receivedSince(days: number): Promise<number> {
    const since = new Date(Date.now() - days * 86_400_000).toISOString();
    const { count, error } = await supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since);
    if (error) throw new Error("Impossible de compter les messages.");
    return count ?? 0;
  },

  async setStatus(id: string, status: ContactMessageStatus): Promise<void> {
    const { error } = await supabase
      .from("contact_messages")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error("Impossible de modifier le statut du message.");
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) throw new Error("Impossible de supprimer le message.");
  },
};