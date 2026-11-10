import {
  BookOpen,
  ClipboardList,
  UserRound,
  Shirt,
  Handshake,
  ShieldCheck,
  Camera,
  Scale,
  type LucideIcon,
} from "lucide-react";

import { useReglement } from "../../hooks/useReglement.tsx";

const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  ClipboardList,
  UserRound,
  Shirt,
  Handshake,
  ShieldCheck,
  Camera,
  Scale,
};

function RuleSection({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#20282D] text-[#D5A46B]">
          <Icon size={20} aria-hidden="true" />
        </div>
        <h2 className="text-lg font-bold text-neutral-900 sm:text-xl">
          {title}
        </h2>
      </div>

      <div className="space-y-3 text-sm leading-7 text-neutral-600">
        {children}
      </div>
    </section>
  );
}

export default function Reglement() {
  const { reglement, sections, loading, error } = useReglement();

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-50 px-5 py-20">
        <p className="text-center text-sm text-neutral-500">
          Chargement du règlement...
        </p>
      </main>
    );
  }

  if (error || !reglement) {
    return (
      <main className="min-h-screen bg-neutral-50 px-5 py-20">
        <p className="text-center text-sm text-red-600">
          Impossible de charger le règlement intérieur.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 pb-16">
      <header className="relative overflow-hidden bg-[#20282D] px-5 py-14 text-white sm:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#D5A46B]">
            Aïkido Club Dieppois
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            {reglement.title}
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-300 sm:text-base">
            {reglement.description}
          </p>

          <div className="mt-7 h-1 w-12 rounded-full bg-[#D5A46B]" />
        </div>
      </header>

      <div className="mx-auto mb-10 max-w-5xl space-y-5 px-5 pt-8 sm:pt-12">
        {/* Notice d'information */}
        <div className="rounded-xl border border-[#D5A46B]/40 bg-[#D5A46B]/10 p-5">
          <div className="flex items-start gap-3">
            <BookOpen
              size={20}
              className="mt-0.5 shrink-0 text-[#9A6B35]"
              aria-hidden="true"
            />

            <div>
              <h2 className="font-semibold text-neutral-900">
                {reglement.noticeTitle}
              </h2>

              <p className="mt-1 text-sm leading-6 text-neutral-700">
                {reglement.noticeText}
              </p>
            </div>
          </div>
        </div>

        {/* Sections du règlement */}
        {sections.map((section) => {
          const Icon = iconMap[section.icon] ?? BookOpen;

          return (
            <RuleSection
              key={section.id}
              icon={Icon}
              title={section.title}
            >
              {section.content.map((paragraph, index) => (
                <p key={`${section.id}-${index}`}>
                  {paragraph}
                </p>
              ))}
            </RuleSection>
          );
        })}

        <div className="pt-2 text-center text-xs text-neutral-400">
          {reglement.lastUpdate}
        </div>
      </div>
    </main>
  );
}
