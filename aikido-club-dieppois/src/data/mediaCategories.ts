export const MEDIA_CATEGORIES = [
  { id: "accueil", label: "Accueil" },
  { id: "club", label: "Club" },
  { id: "cours", label: "Cours" },
  { id: "evenements", label: "Événements" },
  { id: "divers", label: "Divers" },
] as const;

export type MediaCategory = (typeof MEDIA_CATEGORIES)[number]["id"];