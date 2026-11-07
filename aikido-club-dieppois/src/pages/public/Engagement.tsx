import { useTranslation } from "react-i18next";
import {
  Leaf,
  Users,
  HeartHandshake,
  ShieldCheck,
  GraduationCap,
  HandHeart,
  Venus,
} from "lucide-react";

function CommitmentCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="group rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-8">
      <div className="mb-5 flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#20282D] text-[#D5A46B] transition-colors group-hover:bg-[#303B42]">
          <Icon size={23} aria-hidden="true" />
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

export default function Engagement() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-neutral-50 pb-16">
      <header className="relative overflow-hidden bg-[#20282D] px-5 py-14 text-white sm:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#D5A46B]">
            Aïkido Club Dieppois
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            {t("engagements.title")}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-300 sm:text-base">
            {t("engagements.description")}
          </p>
          <div className="mt-7 h-1 w-12 rounded-full bg-[#D5A46B]" />
        </div>
      </header>

      <div className="mx-auto mb-10 max-w-5xl space-y-5 px-5 pt-8 sm:pt-12">
        <div className="mb-8 max-w-3xl">
          <p className="text-base leading-7 text-neutral-600">
            {t("engagements.introduction")}
          </p>
        </div>

        <CommitmentCard
          icon={Leaf}
          title={t("engagements.items.ecodesign.title")}
        >
          <p>{t("engagements.items.ecodesign.p1")}</p>
          <p>{t("engagements.items.ecodesign.p2")}</p>
        </CommitmentCard>

        <CommitmentCard
          icon={Venus}
          title={t("engagements.items.inclusion.title")}
        >
          <p>{t("engagements.items.inclusion.p1")}</p>
          <p>{t("engagements.items.inclusion.p2")}</p>
        </CommitmentCard>

        <CommitmentCard
          icon={ShieldCheck}
          title={t("engagements.items.protection.title")}
        >
          <p>{t("engagements.items.protection.p1")}</p>
          <p>{t("engagements.items.protection.p2")}</p>
        </CommitmentCard>

        <CommitmentCard
          icon={HeartHandshake}
          title={t("engagements.items.respect.title")}
        >
          <p>{t("engagements.items.respect.p1")}</p>
          <p>{t("engagements.items.respect.p2")}</p>
        </CommitmentCard>

        <CommitmentCard
          icon={GraduationCap}
          title={t("engagements.items.transmission.title")}
        >
          <p>{t("engagements.items.transmission.p1")}</p>
          <p>{t("engagements.items.transmission.p2")}</p>
        </CommitmentCard>

        <CommitmentCard
          icon={Users}
          title={t("engagements.items.accessibility.title")}
        >
          <p>{t("engagements.items.accessibility.p1")}</p>
          <p>{t("engagements.items.accessibility.p2")}</p>
        </CommitmentCard>

        <CommitmentCard
          icon={HandHeart}
          title={t("engagements.items.community.title")}
        >
          <p>{t("engagements.items.community.p1")}</p>
          <p>{t("engagements.items.community.p2")}</p>
        </CommitmentCard>

        <div className="rounded-xl bg-[#20282D] p-6 text-white sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D5A46B]">
            Aïkido Club Dieppois
          </p>
          <h2 className="mt-3 text-xl font-bold">
            {t("engagements.conclusion.title")}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-300">
            {t("engagements.conclusion.text")}
          </p>
        </div>
      </div>
    </main>
  );
}
