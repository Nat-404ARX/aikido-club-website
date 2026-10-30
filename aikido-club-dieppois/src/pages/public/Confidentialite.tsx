import { useClubInformation } from "../../hooks/useClubInformation.tsx";

export default function Confidentialite() {
  const { club, loading, error } = useClubInformation();

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-50 pb-16">
        <p>Chargement de la politique de confidentialité...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-neutral-50 pb-16">
        <p>Impossible de charger les informations du club.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 pb-16">
      <header className="relative overflow-hidden bg-[#20282D] px-5 py-14 text-white sm:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#D5A46B]">
            Informations légales
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Politique de confidentialité
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-300 sm:text-base">
            L'Aïkido Club Dieppois accorde une importance particulière
            à la protection de vos données personnelles et au respect
            de votre vie privée.
          </p>
          <div className="mt-7 h-1 w-12 rounded-full bg-[#D5A46B]" />
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-5 px-5 pt-8 mb-10 sm:pt-12">
        <section>
          <h2>1. Informations générales</h2>
          <p>
            La présente politique de confidentialité explique
            comment l'Aïkido Club Dieppois collecte, utilise,
            conserve et protège les données personnelles des
            personnes qui consultent son site internet ou utilisent
            ses fonctionnalités.
          </p>
          <p>
            Les termes « données personnelles », « traitement »,
            « responsable du traitement » et « consentement »
            sont employés au sens du Règlement général sur la
            protection des données (RGPD), notamment son article 4.
          </p>
          <p>
            Cette politique concerne le site internet de
            l'Aïkido Club Dieppois et ses différentes fonctionnalités.
          </p>
        </section>

        <section>
          <h2>2. Objet de la politique</h2>
          <p>
            Lors de l'utilisation du site, l'Aïkido Club Dieppois
            peut être amené à collecter et traiter certaines
            données personnelles.
          </p>
          <p>
            Ces traitements sont réalisés conformément à la
            réglementation applicable, notamment :
          </p>
          <ul>
            <li>
              Le Règlement (UE) 2016/679 du 27 avril 2016 (RGPD).
            </li>
            <li>
              La loi Informatique et Libertés du 6 janvier 1978,
              modifiée.
            </li>
            <li>
              La réglementation applicable aux cookies et autres
              traceurs.
            </li>
          </ul>
          <p>
            L'Aïkido Club Dieppois peut modifier cette politique
            afin de tenir compte des évolutions législatives,
            réglementaires ou techniques.
          </p>
        </section>

        <section>
          <h2>3. Responsable du traitement</h2>
          <p>
            Le responsable du traitement des données personnelles
            collectées sur le site est :
          </p>
          <div className="legal-info">
            <p><strong>Aïkido Club Dieppois</strong></p>
            <p>
              Adresse :{" "}
              {club.address?.join(", ") || "Voir les mentions légales"}
            </p>
            <p>
              Courriel :{" "}
              <a href={`mailto:${club.email}`}>{club.email}</a>
            </p>
          </div>
        </section>

        <section>
          <h2>4. Données personnelles collectées</h2>

          <h3>4.1. Formulaire de contact</h3>
          <p>
            Lorsque vous utilisez le formulaire de contact,
            les informations suivantes peuvent être collectées :
          </p>
          <ul>
            <li>Nom et prénom ;</li>
            <li>Adresse électronique ;</li>
            <li>Numéro de téléphone ;</li>
            <li>Contenu du message.</li>
          </ul>
          <p>
            Ces informations sont utilisées afin de traiter
            votre demande et de permettre à l'association
            de vous apporter une réponse.
          </p>

          <h3>4.2. Données de navigation</h3>
          <p>
            Lors de votre navigation, certaines informations
            techniques peuvent être recueillies, notamment
            par l'intermédiaire des cookies et des services
            utilisés par le site.
          </p>
          <p>
            Ces informations peuvent concerner votre terminal,
            votre navigateur ou vos préférences de navigation,
            selon les services effectivement activés.
          </p>
        </section>

        <section>
          <h2>5. Finalités des traitements</h2>
          <p>
            Les données personnelles sont collectées uniquement
            pour répondre aux besoins du fonctionnement du site
            et de l'activité de l'association.
          </p>
          <ul>
            <li>
              Répondre aux demandes transmises par le formulaire
              de contact ;
            </li>
            <li>
              Assurer le suivi des échanges avec les visiteurs ;
            </li>
            <li>
              Présenter les activités et les événements du club ;
            </li>
            <li>
              Assurer le bon fonctionnement et la sécurité du site ;
            </li>
            <li>
              Mesurer et améliorer l'utilisation du site lorsque
              des outils de mesure d'audience sont activés et
              autorisés.
            </li>
          </ul>
        </section>

        <section>
          <h2>6. Destinataires des données personnelles</h2>
          <p>
            Les données personnelles sont destinées aux personnes
            habilitées de l'Aïkido Club Dieppois, dans la limite
            de leurs fonctions et des besoins liés à la gestion
            de l'association.
          </p>
          <p>
            Certains prestataires techniques peuvent également
            intervenir dans le fonctionnement du site et le
            traitement des données, notamment pour l'hébergement,
            le stockage ou la gestion des services en ligne.
          </p>
          <p>
            Les données ne sont pas destinées à être vendues
            ou communiquées à des tiers à des fins commerciales.
          </p>
          <p>
            Elles peuvent néanmoins être transmises aux autorités
            compétentes lorsque la loi l'exige.
          </p>
        </section>

        <section>
          <h2>7. Transfert des données hors de l'Union européenne</h2>
          <p>
            Certains prestataires techniques peuvent être amenés
            à traiter des données depuis des pays situés en dehors
            de l'Union européenne.
          </p>
          <p>
            Le cas échéant, ces transferts doivent être encadrés
            par les garanties prévues par la réglementation
            applicable en matière de protection des données.
          </p>
        </section>

        <section>
          <h2>8. Durée de conservation</h2>
          <p>
            Les données personnelles sont conservées pendant
            une durée adaptée à la finalité pour laquelle elles
            ont été collectées et dans le respect des obligations
            légales applicables.
          </p>
          <p>
            Les messages transmis par le formulaire de contact
            ne sont pas conservés indéfiniment et peuvent être
            supprimés lorsqu'ils ne sont plus nécessaires
            au traitement de la demande.
          </p>
        </section>

        <section>
          <h2>9. Droits des utilisateurs</h2>
          <p>
            Conformément à la réglementation applicable,
            toute personne concernée dispose, selon les conditions
            prévues par celle-ci, des droits suivants :
          </p>
          <ul>
            <li>
              <strong>Droit d'accès :</strong> obtenir la confirmation
              qu'un traitement est effectué et accéder à ses données.
            </li>
            <li>
              <strong>Droit de rectification :</strong> demander
              la correction de données inexactes ou incomplètes.
            </li>
            <li>
              <strong>Droit à l'effacement :</strong> demander
              la suppression de ses données lorsque les conditions
              légales sont réunies.
            </li>
            <li>
              <strong>Droit à la limitation :</strong> demander
              la limitation de certains traitements.
            </li>
            <li>
              <strong>Droit d'opposition :</strong> s'opposer
              à certains traitements de ses données.
            </li>
            <li>
              <strong>Droit à la portabilité :</strong> récupérer
              certaines données dans un format structuré et lisible
              par machine.
            </li>
          </ul>
          <p>
            Pour exercer ces droits, vous pouvez contacter
            l'association à l'adresse suivante :
          </p>
          <p>
            <a href={`mailto:${club.email}`}>{club.email}</a>
          </p>
          <p>
            Une vérification de votre identité pourra être demandée
            lorsque cela est nécessaire pour protéger vos données.
          </p>
        </section>

        <section>
          <h2>10. Sécurité des données</h2>
          <p>
            L'Aïkido Club Dieppois met en œuvre des mesures
            techniques et organisationnelles destinées à protéger
            les données personnelles contre les accès non autorisés,
            la perte, l'altération ou la divulgation.
          </p>
          <p>
            L'accès aux informations est limité aux personnes
            habilitées et aux prestataires qui en ont besoin
            pour assurer le fonctionnement des services.
          </p>
        </section>

        <section>
          <h2>11. Liens vers des sites tiers</h2>
          <p>
            Le site peut contenir des liens vers des services
            ou des sites externes, notamment des réseaux sociaux.
          </p>
          <p>
            Lorsque vous consultez ces services, leurs propres
            politiques de confidentialité et conditions
            d'utilisation s'appliquent. L'Aïkido Club Dieppois
            ne peut être tenu responsable des traitements
            réalisés indépendamment par ces plateformes.
          </p>
        </section>

        <section>
          <h2>12. Gestion des cookies</h2>

          <h3>12.1. Qu'est-ce qu'un cookie ?</h3>
          <p>
            Un cookie est un petit fichier enregistré sur votre
            terminal lors de la consultation d'un site internet.
            Il permet notamment de mémoriser certaines informations
            relatives à votre navigation ou à vos préférences.
          </p>

          <h3>12.2. Les catégories de cookies</h3>
          <p>
            Le site peut utiliser différentes catégories de cookies
            ou de technologies similaires :
          </p>
          <ul>
            <li>
              <strong>Cookies nécessaires :</strong> indispensables
              au fonctionnement du site et à la mémorisation
              de vos choix de confidentialité.
            </li>
            <li>
              <strong>Cookies de mesure d'audience :</strong>
              éventuellement utilisés pour comprendre la fréquentation
              du site et améliorer ses contenus.
            </li>
            <li>
              <strong>Services tiers :</strong> certains contenus
              intégrés, comme les cartes interactives, peuvent
              faire appel à des services externes.
            </li>
          </ul>

          <h3>12.3. Gestion de vos préférences</h3>
          <p>
            Vous pouvez accepter, refuser ou modifier vos préférences
            concernant les cookies et les services tiers à tout
            moment depuis les paramètres de confidentialité
            accessibles sur le site.
          </p>
          <p>
            Pour davantage d'informations, consultez également
            notre politique de gestion des cookies.
          </p>
        </section>

        <section>
          <h2>13. Contact et réclamations</h2>
          <p>
            Pour toute question concernant cette politique
            ou le traitement de vos données personnelles,
            vous pouvez contacter l'Aïkido Club Dieppois
            par l'intermédiaire de son formulaire de contact
            ou par courrier électronique.
          </p>
          <p>
            Courriel :{" "}
            <a href={`mailto:${club.email}`}>{club.email}</a>
          </p>
          <p>
            Si vous estimez, après avoir contacté l'association,
            que vos droits ne sont pas respectés, vous pouvez
            adresser une réclamation à la Commission nationale
            de l'informatique et des libertés (CNIL).
          </p>
          <p>
            <a
              href="https://www.cnil.fr/fr/plaintes"
              target="_blank"
              rel="noopener noreferrer"
            >
              Consulter la procédure de réclamation de la CNIL
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
