/** Normalise ce que renvoie <MediaPicker onSelect> : URL, { url }, ou tableau des deux. */
type PickResult = { url?: string; publicUrl?: string; src?: string };
export function toUrls(result: unknown): string[] {
  const list = Array.isArray(result) ? result : [result];
  return list
    .map((r) => (typeof r === "string" ? r : ((r as PickResult | null)?.url ?? (r as PickResult | null)?.publicUrl ?? (r as PickResult | null)?.src)))
    .filter((u): u is string => !!u);
}