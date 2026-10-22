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
