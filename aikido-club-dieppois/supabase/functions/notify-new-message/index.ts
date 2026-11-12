// Edge Function : envoie un mail aux admins quand un message de contact est créé.
//
// Emplacement dans ton projet :  <racine du projet>/supabase/functions/notify-new-message/index.ts
//
// Secrets (Dashboard → Edge Functions → Secrets, ou `supabase secrets set`) :
//   WEBHOOK_SECRET  (obligatoire) le même secret que dans le trigger / webhook
//   RESEND_API_KEY  (obligatoire) clé API Resend
//   MAIL_FROM       (facultatif)  défaut : « Aïkido Club <onboarding@resend.dev> »
//   NOTIFY_TO       (facultatif)  adresses séparées par des virgules ; si défini, remplace la liste des admins
//   ADMIN_TABLE     (facultatif)  table contenant les admins (colonne `email`), défaut : admin_users
//   SITE_URL        (facultatif)  pour le bouton « Ouvrir dans le back-office »
import { createClient } from "npm:@supabase/supabase-js@2";

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const oneLine = (s: unknown) => String(s ?? "").replace(/[\r\n]+/g, " ").trim().slice(0, 120);

async function recipients(db: ReturnType<typeof createClient>): Promise<string[]> {
  // 1) liste fixe (obligatoire avec l'expéditeur de test de Resend)
  const fixed = (Deno.env.get("NOTIFY_TO") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (fixed.length) return fixed;

  // 2) table des admins
  const table = Deno.env.get("ADMIN_TABLE") ?? "admin_users";
  const { data, error } = await db.from(table).select("email");
  if (!error && data?.length) {
    return [...new Set((data as { email: string }[]).map((a) => a.email).filter(Boolean))];
  }
  if (error) console.warn(`Table « ${table} » illisible (${error.message}) : repli sur les comptes Supabase Auth.`);

  // 3) comptes Supabase Auth (si seuls les admins ont un compte)
  const { data: users } = await db.auth.admin.listUsers({ perPage: 200 });
  return [...new Set((users?.users ?? []).map((u) => u.email).filter((e): e is string => !!e))];
}

Deno.serve(async (req) => {
  if (req.headers.get("x-webhook-secret") !== Deno.env.get("WEBHOOK_SECRET")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = await req.json().catch(() => null);
  const m = payload?.record;
  if (payload?.type !== "INSERT" || !m?.id) return new Response("Ignored", { status: 200 });

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const to = await recipients(db);
  if (to.length === 0) {
    console.warn("Aucun destinataire pour la notification.");
    return new Response("No recipient", { status: 200 });
  }

  const site = (Deno.env.get("SITE_URL") ?? "").replace(/\/$/, "");
  const link = site ? `${site}/admin/messages` : "";

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto;color:#222">
      <h2 style="margin:0 0 4px">Nouveau message reçu</h2>
      <p style="margin:0 0 20px;color:#666">Via le formulaire de contact du site.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:6px 0;color:#666;width:110px">Nom</td><td><strong>${esc(m.name)}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#666">E-mail</td><td><a href="mailto:${esc(m.email)}">${esc(m.email)}</a></td></tr>
        <tr><td style="padding:6px 0;color:#666">Téléphone</td><td>${esc(m.phone) || "—"}</td></tr>
      </table>
      <div style="margin:20px 0;padding:16px;background:#f5f5f5;border-radius:8px;white-space:pre-wrap;font-size:14px;line-height:1.5">${esc(m.message)}</div>
      ${link ? `<p><a href="${esc(link)}" style="display:inline-block;background:#000;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-size:14px">Ouvrir dans le back-office</a></p>` : ""}
      <p style="color:#999;font-size:12px">Vous pouvez répondre directement à ce mail : la réponse ira à l'expéditeur.</p>
    </div>`;

  const text = `Nouveau message de ${oneLine(m.name)}\nE-mail : ${m.email}\nTéléphone : ${m.phone || "—"}\n\n${m.message}\n\n${link}`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: Deno.env.get("MAIL_FROM") ?? "Aïkido Club <onboarding@resend.dev>",
      to,
      reply_to: m.email,
      subject: `Nouveau message de ${oneLine(m.name)}`,
      html,
      text,
    }),
  });

  if (!res.ok) {
    console.error("Resend :", res.status, await res.text());
    return new Response("Mail failed", { status: 502 });
  }
  return new Response("OK", { status: 200 });
});