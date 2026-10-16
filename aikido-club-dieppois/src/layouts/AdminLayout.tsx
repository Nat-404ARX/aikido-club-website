
import { NavLink, Outlet } from "react-router-dom";

const adminLinks = [
  { to: "/admin", label: "Tableau de bord", end: true },
  { to: "/admin/pages", label: "Pages" },
  { to: "/admin/cours", label: "Cours" },
  { to: "/admin/horaires", label: "Horaires et tarifs" },
  { to: "/admin/evenements", label: "Événements" },
  { to: "/admin/medias", label: "Médias" },
  { to: "/admin/messages", label: "Messages" },
  { to: "/admin/comptes", label: "Comptes administrateurs" },
];

export default function AdminLayout() {
  return (
    <div className="admin-site min-h-screen md:flex">
      <aside className="w-full md:w-64 shrink-0 border-r p-4">
        <p className="mb-6 text-xl font-bold">
          Administration
        </p>

        <nav aria-label="Navigation d'administration">
          <ul className="space-y-1">
            {adminLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 transition-colors ${
                      isActive
                        ? "bg-neutral-900 text-white"
                        : "hover:bg-neutral-100"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-8 border-t pt-4">
          <NavLink
            to="/"
            className="text-sm underline underline-offset-4"
          >
            Retour au site
          </NavLink>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-5 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
