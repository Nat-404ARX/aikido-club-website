import { Outlet } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Waves from "../components/layout/Waves"

export default function PublicLayout() {
  return (
    <div className="public-site min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>
      <Waves />
      <Footer />
    </div>
  );
}
