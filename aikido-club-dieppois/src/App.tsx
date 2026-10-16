import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";

import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";

import Accueil from "./pages/public/Accueil.tsx";
import Club from "./pages/public/Club.tsx";
import Aikido from "./pages/public/Aikido.tsx";
import Cours from "./pages/public/Cours.tsx";
import Horaires from "./pages/public/Horaire.tsx";
import Evenements from "./pages/public/Evenement.tsx";
import Actualite from "./pages/public/Actualite.tsx";
import Contact from "./pages/public/Contact.tsx";

import AdminLogin from "./pages/admin/AdminLogin.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminPages from "./pages/admin/AdminPages.tsx";

import AdminAccueil from "./components/admin/AdminAccueil.tsx";




function PageEnConstruction( titre: any ) {
  return (
    <section className="mx-auto max-w-5xl px-5 py-16">
      <h1 className="text-3xl font-bold">{titre}</h1>
      <p className="mt-3">Cette page est en cours de construction.</p>
    </section>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Site public */}
      <Route element={<PublicLayout />}>
        <Route index element={<Accueil />} />
        <Route path="club" element={<Club />} />
        <Route path="aikido" element={<Aikido />} />
        <Route path="cours" element={<Cours />} />
        <Route path="horaires" element={<Horaires />} />
        <Route path="actualite" element={<Actualite />} />
        <Route path="evenements" element={<Evenements />} />
        <Route path="contact" element={<Contact />} />
      </Route>
      
      {/* Connexion : accessible sans être connecté */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Toutes les routes ci-dessous sont protégées */}
      <Route element={<ProtectedAdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />

          <Route path="pages" element={<AdminPages />} />
          <Route path="pages/accueil" element={<AdminAccueil />} />

          <Route
            path="cours"
            element={<PageEnConstruction titre="Gestion des cours" />}
          />
          <Route
            path="horaires"
            element={<PageEnConstruction titre="Horaires et tarifs" />}
          />
          <Route
            path="actualite"
            element={<PageEnConstruction titre="Actualités" />}
          />
          <Route
            path="evenements"
            element={<PageEnConstruction titre="Gestion des événements" />}
          />
          <Route
            path="medias"
            element={<PageEnConstruction titre="Bibliothèque de médias" />}
          />
          <Route
            path="messages"
            element={<PageEnConstruction titre="Messages reçus" />}
          />
          <Route
            path="comptes"
            element={<PageEnConstruction titre="Comptes administrateurs" />}
          />
        </Route>
      </Route>


      {/* URL inconnue */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
