import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  CalendarDays,
  Image as ImageIcon,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import ScrollReveal from "../../components/ui/ScrollReveal.tsx";
import {
  getActualites,
  type Actualite,
} from "../../services/actualiteService.ts";
import Facebook from "/assets/icons/media/facebook.png"
import { club } from "../../data/info.ts"

const FACEBOOK_PAGE_URL = club.facebook;

function formatDate(date: string, locale: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  const language = locale.toLowerCase().startsWith("en")
    ? "en-GB"
    : "fr-FR";

  return new Intl.DateTimeFormat(language, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

function PublicationCard({
  post,
  locale,
  featured = false,
  t,
}: {
  post: Actualite;
  locale: string;
  featured?: boolean;
  t: (key: string, options?: { count: number }) => string;
}) {
  const images = post.images ?? [];

  return (
    <article
      className={`overflow-hidden rounded-2xl border border-neutral-200 bg-white ${featured ? "shadow-lg" : "shadow-sm"
        }`}
    >
      {/* EN-TÊTE DE LA PUBLICATION */}
      <div className="flex items-center justify-between gap-4 px-5 pt-5 sm:px-7 sm:pt-7">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-white">
            <img src={Facebook} className={"w-12 rounded-xl"} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {t("post.clubName")}
            </p>

            <p className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
              <CalendarDays size={13} />
              {formatDate(post.createdAt, locale)}
            </p>
          </div>
        </div>

        {post.permalink && (
          <a
            href={post.permalink}
            target="_blank"
            rel="noreferrer"
            aria-label={t("post.openOriginal")}
            title={t("post.openOriginal")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 transition-colors hover:border-neutral-950 hover:bg-neutral-950 hover:text-white"
          >
            <ArrowUpRight size={18} />
          </a>
        )}
      </div>

      {/* TEXTE */}
      {post.message && (
        <div className="px-5 pb-5 pt-6 sm:px-7 sm:pb-7">
          <p className="whitespace-pre-line break-words text-sm leading-7 text-neutral-700 sm:text-base sm:leading-8">
            {post.message}
          </p>
        </div>
      )}

      {/* PHOTOS */}
      {images.length > 0 && (
        <div
          className={`grid gap-1 bg-neutral-100 ${images.length === 1
              ? "grid-cols-1"
              : images.length === 2
                ? "grid-cols-2"
                : "grid-cols-2"
            }`}
        >
          {images.map((image, index) => (
            <a
              key={`${image.url}-${index}`}
              href={image.url}
              target="_blank"
              rel="noreferrer"
              className={`group relative block overflow-hidden bg-neutral-100 ${images.length === 1
                  ? "max-h-[650px]"
                  : images.length === 3 && index === 0
                    ? "row-span-2"
                    : "h-48 sm:h-64"
                }`}
              aria-label={t("post.openImage")}
            >
              <img
                src={image.url}
                alt={image.alt || t("post.imageAlt")}
                loading="lazy"
                className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${images.length === 1 ? "max-h-[650px]" : ""
                  }`}
              />

              <span className="absolute inset-0 bg-neutral-950/0 transition-colors group-hover:bg-neutral-950/10" />
            </a>
          ))}
        </div>
      )}

      {/* PIED DE PUBLICATION */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 px-5 py-4 sm:px-7">
        <span className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500">
          <ImageIcon size={15} />
          {images.length === 0
            ? t("post.noPhotos")
            : t("post.photoCount", { count: images.length })}
        </span>

        {post.permalink && (
          <a
            href={post.permalink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold transition-colors hover:text-[var(--color-accent)]"
          >
            {t("post.viewOnFacebook")}
            <ArrowUpRight size={15} />
          </a>
        )}
      </div>
    </article>
  );
}

export default function Actualites() {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState<Actualite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadPosts() {
      setLoading(true);
      setError(false);

      try {
        const result = await getActualites(20);

        if (active) {
          setPosts(result.data);
        }
      } catch (err) {
        console.error("Impossible de charger les actualités :", err);

        if (active) {
          setError(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadPosts();

    return () => {
      active = false;
    };
  }, [retry]);

  return (
    <main className="overflow-hidden bg-[#f5f3ee] text-neutral-950">
      {/* INTRODUCTION */}
      <section className="px-6 pb-18 pt-18 sm:pb-16 sm:pt-16 lg:pb-20 lg:pt-20">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
              {t("actu.eyebrow")}
            </p>

            <h1 className="mt-6 max-w-5xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-8xl">
              {t("actu.title")}
              <span className="text-neutral-400">.</span>
            </h1>

            <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
                {t("actu.description")}
              </p>

              <a
                href="#fil-actualites"
                className="group inline-flex shrink-0 items-center gap-3 text-sm font-semibold"
              >
                {t("actu.cta")}
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 transition-all duration-300 group-hover:border-neutral-950 group-hover:bg-neutral-950 group-hover:text-white">
                  <ArrowDown size={18} />
                </span>
              </a>
            </div>

            {FACEBOOK_PAGE_URL && (
              <a
                href={FACEBOOK_PAGE_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent)]"
              >
                {t("actu.facebook")}
                <ArrowUpRight size={16} />
              </a>
            )}
          </ScrollReveal>
        </div>
      </section>

      {/* FIL D'ACTUALITÉS */}
      <section
        id="fil-actualites"
        className="scroll-mt-20 bg-white px-6 py-20 sm:py-28 lg:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
                  {t("feed.eyebrow")}
                </p>

                <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                  {t("feed.title")}
                </h2>
              </div>

              <p className="max-w-md text-sm leading-relaxed text-neutral-500">
                {t("feed.description")}
              </p>
            </div>
          </ScrollReveal>

          {/* CHARGEMENT */}
          {loading && (
            <div className="flex min-h-64 flex-col items-center justify-center py-16 text-center">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-950" />
              <p className="mt-5 text-sm text-neutral-500">
                {t("feed.loading")}
              </p>
            </div>
          )}

          {/* ERREUR */}
          {!loading && error && (
            <div className="mt-10 rounded-2xl border border-neutral-200 bg-[#f8f7f4] px-6 py-12 text-center">
              <h3 className="text-xl font-semibold">
                {t("feed.errorTitle")}
              </h3>

              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-neutral-600">
                {t("feed.errorDescription")}
              </p>

              <button
                type="button"
                onClick={() => setRetry((value) => value + 1)}
                className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent)]"
              >
                <RefreshCw size={16} />
                {t("feed.retry")}
              </button>
            </div>
          )}

          {/* FIL */}
          {!loading && !error && posts.length > 0 && (
            <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-12">
              <div className="space-y-8">
                {posts.map((post, index) => (
                  <ScrollReveal key={post.id} delay={Math.min(index * 50, 200)}>
                    <PublicationCard
                      post={post}
                      locale={i18n.language}
                      featured={index === 0}
                      t={t}
                    />
                  </ScrollReveal>
                ))}
              </div>

              {/* COLONNE LATÉRALE */}
              <aside className="lg:sticky lg:top-28">
                <div className="rounded-2xl bg-neutral-950 p-6 text-white sm:p-7">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                    <img src={Facebook} className={"w-23 rounded-xl"} />
                  </div>

                  <h3 className="mt-5 text-xl font-semibold">
                    {t("sidebar.title")}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-white/60">
                    {t("sidebar.description")}
                  </p>

                  {FACEBOOK_PAGE_URL && (
                    <a
                      href={FACEBOOK_PAGE_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-6 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[var(--color-accent)]"
                    >
                      {t("sidebar.link")}
                      <ArrowUpRight size={17} />
                    </a>
                  )}
                </div>
              </aside>
            </div>
          )}

          {/* AUCUNE PUBLICATION */}
          {!loading && !error && posts.length === 0 && (
            <div className="mt-10 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-[#f8f7f4] px-6 py-14 text-center">

              <h3 className="mt-5 text-xl font-semibold">
                {t("feed.emptyTitle")}
              </h3>

              <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-500">
                {t("feed.emptyDescription")}
              </p>

              {FACEBOOK_PAGE_URL && (
                <a
                  href={FACEBOOK_PAGE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold hover:text-[var(--color-accent)]"
                >
                  {t("feed.visitFacebook")}
                  <ArrowUpRight size={17} />
                </a>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
