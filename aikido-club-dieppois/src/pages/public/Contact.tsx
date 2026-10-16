import { useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import ScrollReveal from "../../components/ui/ScrollReveal.tsx";

import WhatsApp from "/assets/icons/media/whatsapp.png";
import Youtube from "/assets/icons/media/youtube.png";
import Facebook from "/assets/icons/media/facebook.png";
import Instagram from "/assets/icons/media/instagram.png";
import type { LucideIcon } from "lucide-react";

// À compléter avec les coordonnées officielles du club.
const contact = {
  email: "aikidodieppe@gmail.com",
  phone: "06 60 40 44 22",
  facebook: "https://www.facebook.com/aikidodieppe",
  youtube: "https://www.youtube.com/@aikidoclubdieppois",
  whatsapp: "",
  instagram: "https://www.instagram.com/aikidoclubdieppois/",
};

export default function Contact() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  const contactItems = [
    {
      key: "email",
      value: contact.email,
      href: contact.email ? `mailto:${contact.email}` : "",
      icon: Mail,
      iconType: "lucide",
    },
    {
      key: "phone",
      value: contact.phone,
      href: contact.phone
        ? `tel:${contact.phone.replace(/[^\d+]/g, "")}`
        : "",
      icon: Phone,
      iconType: "lucide",
    },
    {
      key: "facebook",
      value: contact.facebook,
      href: contact.facebook,
      icon: Facebook,
      iconType: "image",
    },
    {
      key: "youtube",
      value: contact.youtube,
      href: contact.youtube,
      icon: Youtube,
      iconType: "image",
    },
    {
      key: "whatsapp",
      value: contact.whatsapp,
      href: contact.whatsapp,
      icon: WhatsApp,
      iconType: "image",
    },
    {
      key: "instagram",
      value: contact.instagram,
      href: contact.instagram,
      icon: Instagram,
      iconType: "image",
    },
  ];

  type IconItem =
    | { key: string; iconType: "image"; icon: string }
    | { key: string; iconType: "lucide"; icon: LucideIcon };

  const renderIcon = (item: IconItem) => {
    if (item.iconType === "image") {
      return <img src={item.icon} alt={item.key} className="w-25 rounded-xl" />;
    }

    const Icon = item.icon;
    return <Icon size={22} />;
  };


  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Démonstration front uniquement : aucun message n'est envoyé.
    setSubmitted(true);
  }

  return (
    <main className="overflow-hidden bg-[#f5f3ee] text-neutral-950">
      {/* INTRODUCTION */}
      <section className="px-6 pb-16 pt-18 sm:pb-20 sm:pt-16 lg:pt-22">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
              {t("contact.eyebrow")}
            </p>

            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-8xl">
              {t("contact.title")}
              <span className="text-neutral-400">.</span>
            </h1>

            <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg">
                {t("contact.description")}
              </p>

              <a
                href="#formulaire"
                className="group inline-flex items-center gap-3 text-sm font-semibold"
              >
                {t("contact.cta")}
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 transition-all duration-300 group-hover:border-neutral-950 group-hover:bg-neutral-950 group-hover:text-white">
                  <ArrowUpRight size={19} />
                </span>
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* COORDONNÉES */}
      <section className="bg-neutral-950 px-6 py-20 text-white sm:py-28 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
              {t("details.eyebrow")}
            </p>

            <div className="mt-4 grid gap-8 md:grid-cols-2 md:items-end">
              <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                {t("details.title")}
              </h2>

              <p className="max-w-lg leading-relaxed text-white/60 md:justify-self-end">
                {t("details.description")}
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {contactItems.map((item, index) => {
              const content = (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 transition-colors group-hover:bg-[var(--color-accent)]">
                    {renderIcon(item)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                      {t(`details.channels.${item.key}`)}
                    </p>

                    <p className="mt-2 break-words text-sm font-medium">
                      {item.value || t("details.toComplete")}
                    </p>
                  </div>

                  <ArrowUpRight
                    size={18}
                    className="shrink-0 text-white/40 transition-colors group-hover:text-white"
                  />
                </>
              );

              return (
                <ScrollReveal key={item.key} delay={index * 60}>
                  {item.href ? (
                    <a
                      href={item.href}
                      target={
                        ["facebook", "youtube", "whatsapp", "instagram"].includes(
                          item.key,
                        )
                          ? "_blank"
                          : undefined
                      }
                      rel={
                        ["facebook", "youtube", "whatsapp", "instagram"].includes(
                          item.key,
                        )
                          ? "noreferrer"
                          : undefined
                      }
                      className="group flex h-full min-h-28 items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-white/[0.08]"
                    >
                      {content}
                    </a>
                  ) : (
                    <div className="group flex h-full min-h-28 items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                      {content}
                    </div>
                  )}
                </ScrollReveal>
              );
            })}
          </div>

          <div className="mt-8 flex items-start gap-4 border-t border-white/10 pt-8">
            <MapPin size={21} className="mt-1 shrink-0 text-white/60" />

            <div>
              <h3 className="font-semibold">{t("details.locationTitle")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                {t("location.address")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FORMULAIRE */}
      <section
        id="formulaire"
        className="scroll-mt-20 px-6 py-20 sm:py-28 lg:py-32"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <ScrollReveal>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
                {t("form.eyebrow")}
              </p>

              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                {t("form.title")}
              </h2>

              <p className="mt-6 max-w-md leading-relaxed text-neutral-600">
                {t("form.description")}
              </p>

              <div className="mt-8 flex items-start gap-3 text-sm leading-relaxed text-neutral-500">
                <CheckCircle2
                  size={19}
                  className="mt-0.5 shrink-0 text-[var(--color-accent)]"
                />
                <p>{t("form.requiredNote")}</p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <form
              onSubmit={handleSubmit}
              onChange={() => setSubmitted(false)}
              className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="contact-name"
                    className="mb-2 block text-sm font-semibold"
                  >
                    {t("form.fields.name")}
                    <span className="ml-1 text-[var(--color-accent)]">*</span>
                  </label>

                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder={t("form.placeholders.name")}
                    className="min-h-12 w-full rounded-xl border border-neutral-200 bg-[#faf9f6] px-4 py-3 text-sm outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-2 block text-sm font-semibold"
                  >
                    {t("form.fields.email")}
                    <span className="ml-1 text-[var(--color-accent)]">*</span>
                  </label>

                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder={t("form.placeholders.email")}
                    className="min-h-12 w-full rounded-xl border border-neutral-200 bg-[#faf9f6] px-4 py-3 text-sm outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-phone"
                    className="mb-2 block text-sm font-semibold"
                  >
                    {t("form.fields.phone")}
                    <span className="ml-1 text-[var(--color-accent)]">*</span>
                  </label>

                  <input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    placeholder={t("form.placeholders.phone")}
                    className="min-h-12 w-full rounded-xl border border-neutral-200 bg-[#faf9f6] px-4 py-3 text-sm outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="contact-message"
                    className="mb-2 block text-sm font-semibold"
                  >
                    {t("form.fields.message")}
                    <span className="ml-1 text-[var(--color-accent)]">*</span>
                  </label>

                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={6}
                    placeholder={t("form.placeholders.message")}
                    className="w-full resize-y rounded-xl border border-neutral-200 bg-[#faf9f6] px-4 py-3 text-sm outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-7 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-neutral-950 px-6 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 sm:w-auto sm:min-w-52"
              >
                {t("form.submit")}
                <Send size={17} />
              </button>

              {submitted && (
                <p
                  role="status"
                  className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950"
                >
                  {t("form.demoNotice")}
                </p>
              )}
            </form>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
