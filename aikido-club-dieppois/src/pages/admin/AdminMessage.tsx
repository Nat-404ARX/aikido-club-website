import { useCallback, useEffect, useState } from "react";
import {
  Archive,
  ArrowLeft,
  Check,
  Inbox,
  LoaderCircle,
  Mail,
  MailOpen,
  RefreshCw,
  RotateCcw,
  Trash2,
} from "lucide-react";
import {
  messagesService,
  type ContactMessage,
  type ContactMessageStatus,
} from "../../services/messagesService.ts";

type Filter = "all" | ContactMessageStatus;

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "new", label: "Nouveaux" },
  { value: "read", label: "Lus" },
  { value: "archived", label: "Archivés" },
];

const statusLabels: Record<ContactMessageStatus, string> = {
  new: "Nouveau",
  read: "Lu",
  archived: "Archivé",
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function Message() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await messagesService.list();
      setMessages(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les messages."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  const visibleMessages = messages.filter(
    (message) => filter === "all" || message.status === filter
  );

  const counts = {
    all: messages.length,
    new: messages.filter((message) => message.status === "new").length,
    read: messages.filter((message) => message.status === "read").length,
    archived: messages.filter((message) => message.status === "archived").length,
  };

  async function changeStatus(
    message: ContactMessage,
    status: ContactMessageStatus
  ) {
    setBusy(true);
    setError(null);

    try {
      await messagesService.setStatus(message.id, status);

      setMessages((current) =>
        current.map((item) =>
          item.id === message.id
            ? {
              ...item,
              status,
              updated_at: new Date().toISOString(),
            }
            : item
        )
      );

      setSelected((current) =>
        current?.id === message.id
          ? { ...current, status, updated_at: new Date().toISOString() }
          : current
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "La modification a échoué."
      );
    } finally {
      setBusy(false);
    }
  }

  async function deleteMessage(message: ContactMessage) {
    const confirmed = window.confirm(
      `Supprimer définitivement le message de ${message.name} ? Cette action est irréversible.`
    );

    if (!confirmed) return;

    setBusy(true);
    setError(null);

    try {
      await messagesService.delete(message.id);
      setMessages((current) =>
        current.filter((item) => item.id !== message.id)
      );
      setSelected(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "La suppression a échoué."
      );
    } finally {
      setBusy(false);
    }
  }

  async function openMessage(message: ContactMessage) {
    setSelected(message);

    if (message.status === "new") {
      await changeStatus(message, "read");
    }
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-neutral-500">Administration</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Messages
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Consulte et organise les messages envoyés depuis le formulaire de contact.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadMessages()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Actualiser
        </button>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={`rounded-xl border p-4 text-left transition ${filter === item.value
                ? "border-neutral-950 bg-neutral-950 text-white"
                : "border-neutral-200 bg-white hover:bg-neutral-50"
              }`}
          >
            <span className="text-sm">{item.label}</span>
            <span className="mt-2 block text-2xl font-semibold">
              {counts[item.value]}
            </span>
          </button>
        ))}
      </div>

      {selected ? (
        <article className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-8">
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-950"
          >
            <ArrowLeft size={16} />
            Retour à la liste
          </button>

          <div className="flex flex-col justify-between gap-4 sm:flex-row">
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                {statusLabels[selected.status]}
              </span>
              <h2 className="mt-2 text-2xl font-semibold">
                {selected.name}
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                Reçu le {dateFormatter.format(new Date(selected.created_at))}
              </p>
            </div>

            <div className="flex flex-wrap items-start gap-2">
              {selected.status !== "archived" ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void changeStatus(selected, "archived")}
                  className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-50"
                >
                  <Archive size={15} />
                  Archiver
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void changeStatus(selected, "read")}
                  className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-50"
                >
                  <RotateCcw size={15} />
                  Restaurer
                </button>
              )}

              {selected.status === "new" ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void changeStatus(selected, "read")}
                  className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-50"
                >
                  <Check size={15} />
                  Marquer comme lu
                </button>
              ) : selected.status === "read" ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void changeStatus(selected, "new")}
                  className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-50"
                >
                  <Mail size={15} />
                  Marquer comme nouveau
                </button>
              ) : null}

              <button
                type="button"
                disabled={busy}
                onClick={() => void deleteMessage(selected)}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 size={15} />
                Supprimer
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-5 border-y border-neutral-100 py-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                Adresse e-mail
              </p>
              <a
                href={`mailto:${selected.email}`}
                className="mt-2 block break-all text-sm underline underline-offset-4"
              >
                {selected.email}
              </a>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                Téléphone
              </p>
              <a
                href={`tel:${selected.phone}`}
                className="mt-2 block text-sm underline underline-offset-4"
              >
                {selected.phone}
              </a>
            </div>
          </div>

          <div className="pt-6">
            <h3 className="text-sm font-semibold">Message</h3>
            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-neutral-700">
              {selected.message}
            </p>
          </div>

          {busy && (
            <p className="mt-5 text-sm text-neutral-500">
              Enregistrement en cours…
            </p>
          )}
        </article>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          {loading ? (
            <div className="flex items-center justify-center gap-3 p-12 text-sm text-neutral-500">
              <LoaderCircle size={18} className="animate-spin" />
              Chargement des messages…
            </div>
          ) : visibleMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Inbox size={32} className="text-neutral-400" />
              <h2 className="mt-4 font-semibold">Aucun message</h2>
              <p className="mt-2 text-sm text-neutral-500">
                Aucun message ne correspond à ce filtre.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {visibleMessages.map((message) => (
                <li key={message.id}>
                  <button
                    type="button"
                    onClick={() => void openMessage(message)}
                    className="flex w-full items-start gap-4 p-5 text-left transition hover:bg-neutral-50"
                  >
                    <span className="mt-1 text-neutral-500">
                      {message.status === "new" ? (
                        <Mail size={19} />
                      ) : (
                        <MailOpen size={19} />
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{message.name}</span>
                        <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-600">
                          {statusLabels[message.status]}
                        </span>
                      </span>
                      <span className="mt-1 block truncate text-sm text-neutral-500">
                        {message.email} · {message.phone}
                      </span>
                      <span className="mt-2 block whitespace-pre-wrap break-words text-sm text-neutral-600">
                        {message.message.length > 180
                          ? `${message.message.slice(0, 180)}…`
                          : message.message}
                      </span>
                    </span>

                    <span className="shrink-0 text-right text-xs text-neutral-500">
                      {dateFormatter.format(new Date(message.created_at))}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
