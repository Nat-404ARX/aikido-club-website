import { useCallback, useSyncExternalStore } from "react";
import {
  clubInformationService,
  defaultClubInformation,
  type ClubInformationInput,
} from "../services/clubInformationService";

export type ClubInfo = {
  email: string;
  phone: string;
  phoneHref: string;
  facebook: string;
  youtube: string;
  whatsapp: string;
  instagram: string;
  address: string[];
  mapsUrl: string;
  miniMapsUrl: string;

  legalClubNumber: string;
  legalAssociationType: string;
  legalDiscipline: string;
  legalPresidentName: string;
  legalSocialObject: string;
  legalPracticeAddress: string;
  legalRegisteredOffice: string;
  legalPublicationDirector: string;
  legalHostName: string;
  legalHostCompany: string;
  legalHostAddress: string;
  legalHostContact: string;
  legalPartnerUrl: string;
};

export type AnnualScheduleInfo = {
  season: string;
  image: string;
  pdf: string;
};

function mapInformation(data: ClubInformationInput) {
  return {
    club: {
      email: data.email,
      phone: data.phone,
      phoneHref: data.phone_href,
      facebook: data.facebook,
      youtube: data.youtube,
      whatsapp: data.whatsapp,
      instagram: data.instagram,
      address: [...data.address],
      mapsUrl: data.maps_url,
      miniMapsUrl: data.mini_maps_url,

      // Informations légales
      legalClubNumber: data.legal_club_number,
      legalAssociationType: data.legal_association_type,
      legalDiscipline: data.legal_discipline,
      legalPresidentName: data.legal_president_name,
      legalSocialObject: data.legal_social_object,
      legalPracticeAddress: data.legal_practice_address,
      legalRegisteredOffice: data.legal_registered_office,
      legalPublicationDirector: data.legal_publication_director,
      legalHostName: data.legal_host_name,
      legalHostCompany: data.legal_host_company,
      legalHostAddress: data.legal_host_address,
      legalHostContact: data.legal_host_contact,
      legalPartnerUrl: data.legal_partner_url,
    },
    annualSchedule: {
      season: data.season,
      image: data.annual_schedule_image,
      pdf: data.annual_schedule_pdf,
    },
  };
}

const defaults = mapInformation(defaultClubInformation);

const initialSnapshot = {
  data: defaults,
  loading: true,
  error: null as string | null,
};

let snapshot = initialSnapshot;
let loadPromise: Promise<void> | null = null;

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return snapshot;
}

async function fetchInformation() {
  if (loadPromise) return loadPromise;

  snapshot = {
    ...snapshot,
    loading: true,
    error: null,
  };
  notify();

  loadPromise = (async () => {
    try {
      const data = await clubInformationService.get();

      snapshot = {
        data: mapInformation(data),
        loading: false,
        error: null,
      };
    } catch (err: unknown) {
      snapshot = {
        ...snapshot,
        loading: false,
        error:
          err instanceof Error
            ? err.message
            : "Impossible de charger les informations du club.",
      };
    } finally {
      loadPromise = null;
      notify();
    }
  })();

  return loadPromise;
}

export function refreshClubInformation() {
  return fetchInformation();
}

// Chargement initial des données
void fetchInformation();

export function useClubInformation() {
  const current = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot
  );

  const refresh = useCallback(() => {
    return refreshClubInformation();
  }, []);

  return {
    club: current.data.club,
    annualSchedule: current.data.annualSchedule,
    loading: current.loading,
    error: current.error,
    refresh,
  };
}
