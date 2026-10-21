import { supabase } from "../lib/supabase";

export const MEDIA_BUCKET = "club-media";
export const MAX_MEDIA_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

export interface MediaFile {
  name: string;
  id: string;
  path: string;
  url: string;
  size: number;
  contentType: string;
  createdAt: string | null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Une erreur est survenue lors de l'opération sur le média.";
}

function sanitizeFileName(name: string): string {
  const lastDot = name.lastIndexOf(".");
  const extension = lastDot >= 0 ? name.slice(lastDot).toLowerCase() : "";
  const base = lastDot >= 0 ? name.slice(0, lastDot) : name;

  const safeBase = base
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${safeBase || "image"}${extension}`;
}

function validateFile(file: File): void {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      "Format non accepté. Utilise une image JPEG, PNG, WebP, GIF ou AVIF."
    );
  }

  if (file.size <= 0 || file.size > MAX_MEDIA_SIZE) {
    throw new Error("L'image doit peser moins de 5 Mo.");
  }
}

function toMediaFile(
  category: MediaCategory,
  item: {
    name: string;
    id: string;
    created_at?: string;
    metadata?: Record<string, unknown> | null;
  }
): MediaFile {
  const path = `${category}/${item.name}`;
  const { data } = supabase.storage
    .from(MEDIA_BUCKET)
    .getPublicUrl(path);

  const metadata = item.metadata ?? {};

  return {
    name: item.name,
    id: item.id,
    path,
    url: data.publicUrl,
    size: Number(metadata.size ?? 0),
    contentType: String(metadata.mimetype ?? ""),
    createdAt: item.created_at ?? null,
  };
}

export const mediaService = {
  async list(category: MediaCategory): Promise<MediaFile[]> {
    const { data, error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .list(category, {
        limit: 100,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) {
      throw new Error(`Impossible de charger les images : ${error.message}`);
    }

    return (data ?? [])
      .filter((item) => Boolean(item.id) && Boolean(item.name))
      .map((item) => toMediaFile(category, item));
  },

  async upload(
    file: File,
    category: MediaCategory
  ): Promise<MediaFile> {
    validateFile(file);

    const path = `${category}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;

    const { data, error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      throw new Error(`Impossible d'importer l'image : ${error.message}`);
    }

    const { data: publicData } = supabase.storage
      .from(MEDIA_BUCKET)
      .getPublicUrl(data.path);

    return {
      name: data.path.split("/").pop() ?? file.name,
      id: data.id,
      path: data.path,
      url: publicData.publicUrl,
      size: file.size,
      contentType: file.type,
      createdAt: new Date().toISOString(),
    };
  },

  async delete(media: MediaFile): Promise<void> {
    const { error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .remove([media.path]);

    if (error) {
      throw new Error(`Impossible de supprimer l'image : ${error.message}`);
    }
  },
};

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function getMediaError(error: unknown): string {
  return getErrorMessage(error);
}
