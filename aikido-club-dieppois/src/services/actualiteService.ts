export interface ActualiteImage {
  url: string;
  alt?: string;
}

export interface Actualite {
  id: string;
  message: string;
  createdAt: string;
  permalink: string | null;
  images: ActualiteImage[];
}

interface ActualitesResponse {
  data: Actualite[];
  nextCursor: string | null;
}

const API_BASE_URL = (
  import.meta.env.VITE_API_URL as string | undefined
)?.replace(/\/$/, "");

const DEMO_MODE =
  import.meta.env.VITE_ACTUALITES_DEMO === "true";

const demoPosts: Actualite[] = [
  {
    id: "demo-1",
    message:
      "Exemple de publication à remplacer par une actualité du club. Le texte et les photos seront récupérés automatiquement depuis Facebook lorsque l’accès sera configuré.",
    createdAt: "2026-09-15T10:00:00+02:00",
    permalink: null,
    images: [],
  },
];

export async function getActualites(
  limit = 20,
): Promise<ActualitesResponse> {
  // Prévisualisation locale, activée explicitement.
  if (DEMO_MODE) {
    return {
      data: demoPosts.slice(0, limit),
      nextCursor: null,
    };
  }

  if (!API_BASE_URL) {
    return {
      data: [],
      nextCursor: null,
    };
  }

  const response = await fetch(
    `${API_BASE_URL}/api/actualites?limit=${limit}`,
  );

  if (!response.ok) {
    throw new Error(`Erreur API : ${response.status}`);
  }

  const result = (await response.json()) as ActualitesResponse;

  return {
    data: result.data ?? [],
    nextCursor: result.nextCursor ?? null,
  };
}
