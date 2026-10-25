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
import EvenementDetail from "./pages/public/EvenementDetail.tsx";
import Actualite from "./pages/public/Actualite.tsx";
import Contact from "./pages/public/Contact.tsx";

import MentionLegal from "./pages/public/MentionLegal.tsx";
import Cookie from "./pages/public/Cookie.tsx";
import Confidentialite from "./pages/public/Confidentialite.tsx";
import Engagement from "./pages/public/Engagement.tsx";
import Reglement from "./pages/public/Reglement.tsx";

import AdminLogin from "./pages/admin/AdminLogin.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminPages from "./pages/admin/AdminPages.tsx";
import AdminComptes from "./pages/admin/AdminComptes.tsx";
import AdminEvenement from "./pages/admin/AdminEvenement";
import AdminCours from "./pages/admin/AdminCours";
import AdminHoraire from "./pages/admin/AdminHoraire";
import AdminMedia from "./pages/admin/AdminMedia";
import Message from "./pages/admin/AdminMessage.tsx";

import AdminAccueil from "./components/admin/AdminAccueil.tsx";
import AdminProfesseurs from "./components/admin/AdminTeacher.tsx";
import AdminInformationsClub from "./components/admin/AdminInformationClub.tsx";
import AdminClub from "./components/admin/AdminClub.tsx";




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
        <Route path="evenements" element={<Evenements />} />
        <Route path="evenements/:slug" element={<EvenementDetail />} />
        <Route path="actualite" element={<Actualite />} />
        <Route path="contact" element={<Contact />} />

        <Route path="mention-legal" element={<MentionLegal />} />
        <Route path="confidentialite" element={<Confidentialite />} />
        <Route path="cookies" element={<Cookie />} />
        <Route path="engagement" element={<Engagement />} />
        <Route path="reglement-interieur" element={<Reglement />} />
      </Route>
      
      {/* Connexion : accessible sans être connecté */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Toutes les routes ci-dessous sont protégées */}
      <Route element={<ProtectedAdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />

          <Route path="pages" element={<AdminPages />} />
          <Route path="pages/accueil" element={<AdminAccueil />} />
          <Route path="pages/professeurs" element={<AdminProfesseurs />} />
          <Route path="pages/informations-club" element={<AdminInformationsClub />} />
          <Route path="pages/club" element={<AdminClub />} />

          <Route path="cours" element={<AdminCours />} />
          <Route path="horaires" element={<AdminHoraire />} />
          <Route path="evenements" element={<AdminEvenement />} />
          <Route path="medias" element={<AdminMedia />} />

          <Route path="messages" element={<Message />} />

          <Route element={<ProtectedAdminRoute requiredRole="super_admin" />}>
            <Route path="comptes" element={<AdminComptes />} />
          </Route>
        </Route>
      </Route>


      {/* URL inconnue */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
