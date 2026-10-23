import './i18n';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import { AdminShortcut } from "./components/admin/AdminShortCut.tsx"
import { CookieConsentProvider } from "./components/ui/CookieConsentContext.tsx";
import CookieConsent from "./components/ui/CookieConsent.tsx";

import './index.css';
import "@fontsource-variable/material-symbols-rounded";
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CookieConsentProvider>
      <BrowserRouter>
        <AdminShortcut />
        <App />
      </BrowserRouter>
      <CookieConsent />
    </CookieConsentProvider>
  </StrictMode>
);
