import { useClubInformation } from "../../hooks/useClubInformation";
import {
  Building2,
  MapPin,
  Phone,
  Monitor,
  ExternalLink,
  CircleHelp,
} from "lucide-react";

function LegalSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
          <Icon size={20} aria-hidden="true" />
        </div>
        <h2 className="text-xl font-semibold text-neutral-900">{title}</h2>
      </div>
      <div className="space-y-3 text-sm leading-7 text-neutral-700 sm:text-base">
        {children}
      </div>
    </section>
  );
}

function LegalValue({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  const displayedValue = value?.trim() || "À compléter par le club";

  return (
    <div>
      <dt className="font-medium text-neutral-900">{label}</dt>
      <dd className="whitespace-pre-line">{displayedValue}</dd>
    </div>
  );
}

export default function MentionLegal() {
  const {
    club,
    loading,
    error,
  } = useClubInformation();

  console.log(club);

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-5 py-16">
        <p className="text-neutral-500">
          Chargement des informations légales…
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-5xl px-5 py-16">
        <p role="alert" className="text-red-700">
          Impossible de charger les informations légales.
        </p>
      </main>
    );
  }

  const phone = club.phone || "À compléter par le club";
  const partnerUrl =
    club.legalPartnerUrl || "https://www.faisonsdusport.fr";

  return (
    <main className="min-h-screen bg-neutral-50 pb-16">
      <header className="relative overflow-hidden bg-[#20282D] px-5 py-14 text-white sm:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#D5A46B]">
            Aïkido Club Dieppois
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Mentions légales
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-300 sm:text-base">
            Retrouvez les informations relatives à l’association,
            à sa responsabilité éditoriale et à l’hébergement de ce site.
          </p>
          <div className="mt-7 h-1 w-12 rounded-full bg-[#D5A46B]" />
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-5 px-5 pt-8 sm:pt-12">
        <LegalSection icon={Building2} title="L’association">
          <dl className="grid gap-5 sm:grid-cols-2">
            <LegalValue
              label="Nom de l’association"
              value={club.legalSocialObject}
            />
            <LegalValue
              label="Type de structure"
              value={club.legalAssociationType}
            />
            <LegalValue
              label="Discipline"
              value={club.legalDiscipline}
            />
            <LegalValue
              label="Numéro de club"
              value={club.legalClubNumber}
            />
            <LegalValue
              label="Président de l’association"
              value={club.legalPresidentName}
            />
          </dl>
        </LegalSection>

        <LegalSection icon={MapPin} title="Adresses">
          <dl className="grid gap-6 sm:grid-cols-2">
            <LegalValue
              label="Lieu de pratique"
              value={club.legalPracticeAddress}
            />
            <LegalValue
              label="Siège social"
              value={club.legalRegisteredOffice}
            />
          </dl>
        </LegalSection>

        <LegalSection icon={Phone} title="Contact">
          <dl className="grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="font-medium text-neutral-900">Téléphone</dt>
              <dd>
                {club.phone ? (
                  <a
                    href={`tel:${club.phone.replace(/[^\d+]/g, "")}`}
                    className="underline decoration-neutral-300 underline-offset-4 hover:text-neutral-950"
                  >
                    {phone}
                  </a>
                ) : (
                  phone
                )}
              </dd>
            </div>
            <LegalValue
              label="Directeur de la publication"
              value={club.legalPublicationDirector}
            />
          </dl>
        </LegalSection>

        <LegalSection icon={Monitor} title="Hébergement du site">
          <p>
            Les informations relatives à l’hébergeur doivent être confirmées
            par l’association.
          </p>
          <dl className="grid gap-5 sm:grid-cols-2">
            <LegalValue
              label="Nom de l’hébergeur"
              value={club.legalHostName}
            />
            <LegalValue
              label="Raison sociale"
              value={club.legalHostCompany}
            />
            <LegalValue
              label="Adresse"
              value={club.legalHostAddress}
            />
            <LegalValue
              label="Coordonnées"
              value={club.legalHostContact}
            />
          </dl>
        </LegalSection>

        <LegalSection icon={ExternalLink} title="Partenaire">
          <p>
            Découvrez également notre site partenaire :
          </p>
          <a
            href={partnerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-medium text-neutral-900 underline decoration-[#D5A46B] underline-offset-4 hover:text-neutral-600"
          >
            Faisons du sport
            <ExternalLink size={15} aria-hidden="true" />
          </a>
        </LegalSection>

      </div>
    </main>
  );
}
