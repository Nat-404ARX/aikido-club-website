import { useTranslation } from "react-i18next";
import {
  BookOpen,
  ClipboardList,
  UserRound,
  Shirt,
  Handshake,
  ShieldCheck,
  Camera,
  Scale,
} from "lucide-react";

function RuleSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
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
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-neutral-50 pb-16">
      <header className="relative overflow-hidden bg-[#20282D] px-5 py-14 text-white sm:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#D5A46B]">
            Aïkido Club Dieppois
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            {t("reglement.title")}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-300 sm:text-base">
            {t("reglement.description")}
          </p>
          <div className="mt-7 h-1 w-12 rounded-full bg-[#D5A46B]" />
        </div>
      </header>

      <div className="mx-auto mb-10 max-w-5xl space-y-5 px-5 pt-8 sm:pt-12">
        <div className="rounded-xl border border-[#D5A46B]/40 bg-[#D5A46B]/10 p-5">
          <div className="flex items-start gap-3">
            <BookOpen
              size={20}
              className="mt-0.5 shrink-0 text-[#9A6B35]"
              aria-hidden="true"
            />
            <div>
              <h2 className="font-semibold text-neutral-900">
                {t("reglement.notice.title")}
              </h2>
              <p className="mt-1 text-sm leading-6 text-neutral-700">
                {t("reglement.notice.text")}
              </p>
            </div>
          </div>
        </div>

        <RuleSection
          icon={ClipboardList}
          title={t("reglement.sections.object.title")}
        >
          <p>{t("reglement.sections.object.p1")}</p>
          <p>{t("reglement.sections.object.p2")}</p>
        </RuleSection>

        <RuleSection
          icon={UserRound}
          title={t("reglement.sections.registration.title")}
        >
          <p>{t("reglement.sections.registration.p1")}</p>
          <p>{t("reglement.sections.registration.p2")}</p>
          <p>{t("reglement.sections.registration.p3")}</p>
        </RuleSection>

        <RuleSection
          icon={Shirt}
          title={t("reglement.sections.equipment.title")}
        >
          <p>{t("reglement.sections.equipment.p1")}</p>
          <p>{t("reglement.sections.equipment.p2")}</p>
          <p>{t("reglement.sections.equipment.p3")}</p>
        </RuleSection>

        <RuleSection
          icon={Handshake}
          title={t("reglement.sections.behavior.title")}
        >
          <p>{t("reglement.sections.behavior.p1")}</p>
          <p>{t("reglement.sections.behavior.p2")}</p>
          <p>{t("reglement.sections.behavior.p3")}</p>
        </RuleSection>

        <RuleSection
          icon={ShieldCheck}
          title={t("reglement.sections.safety.title")}
        >
          <p>{t("reglement.sections.safety.p1")}</p>
          <p>{t("reglement.sections.safety.p2")}</p>
          <p>{t("reglement.sections.safety.p3")}</p>
        </RuleSection>

        <RuleSection
          icon={Camera}
          title={t("reglement.sections.image.title")}
        >
          <p>{t("reglement.sections.image.p1")}</p>
          <p>{t("reglement.sections.image.p2")}</p>
        </RuleSection>

        <RuleSection
          icon={Scale}
          title={t("reglement.sections.application.title")}
        >
          <p>{t("reglement.sections.application.p1")}</p>
          <p>{t("reglement.sections.application.p2")}</p>
        </RuleSection>

        <div className="pt-2 text-center text-xs text-neutral-400">
          {t("reglement.lastUpdate")}
        </div>
      </div>
    </main>
  );
}
