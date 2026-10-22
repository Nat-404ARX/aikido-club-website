import { Link } from "react-router-dom";
import { ArrowRight, House, Users, ContactRound } from "lucide-react";

export default function AdminPages() {
  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm font-medium text-neutral-500">
          Administration / Pages
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Gestion des pages
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-500">
          Gérez le contenu des différentes pages du site du club.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Link
          to="/admin/pages/accueil"
          className="group rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-400 hover:shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex size-11 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
              <House aria-hidden="true" className="size-5" />
            </div>

            <ArrowRight
              aria-hidden="true"
              className="size-5 text-neutral-400 transition group-hover:translate-x-1 group-hover:text-neutral-900"
            />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-neutral-900">
            Accueil
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-neutral-500">
            Gérez les contenus et les éléments affichés sur la page d’accueil.
          </p>
        </Link>

        <Link
          to="/admin/pages/professeurs"
          className="group rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-400 hover:shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex size-11 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
              <Users aria-hidden="true" className="size-5" />
            </div>

            <ArrowRight
              aria-hidden="true"
              className="size-5 text-neutral-400 transition group-hover:translate-x-1 group-hover:text-neutral-900"
            />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-neutral-900">
            Professeurs
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-neutral-500">
            Ajoutez des professeurs, modifiez leurs fiches et leurs photos,
            gérez leur présence sur le site et organisez leur ordre d’affichage.
          </p>
        </Link>


        <Link
          to="/admin/pages/informations-club"
          className="group rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-400 hover:shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex size-11 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
              <ContactRound aria-hidden="true" className="size-5" />
            </div>

            <ArrowRight
              aria-hidden="true"
              className="size-5 text-neutral-400 transition group-hover:translate-x-1 group-hover:text-neutral-900"
            />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-neutral-900">
            Informations du club
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-neutral-500">
            Modifiez les coordonnées, les réseaux sociaux, l’adresse du dojo et
            le planning annuel sans toucher au code.
          </p>
        </Link>

      </div>
    </section>
  );
}