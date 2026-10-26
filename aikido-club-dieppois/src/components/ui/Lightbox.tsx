import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type Props = {
  photos: { url: string; alt?: string }[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
};


export default function Lightbox({ photos, index, onIndex, onClose }: Props) {
  const { t } = useTranslation();
  const n = photos.length;
  const go = (d: number) => onIndex((index + d + n) % n);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  });

  const p = photos[index];
  const btn =
    "flex h-12 w-12 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-white";

  return (
    <div role="dialog" aria-modal="true" className="lightbox-in fixed inset-0 z-[100] flex flex-col bg-black/95 p-4 sm:p-8" onClick={onClose}>
      <div className="flex items-center justify-between text-sm text-white/70" onClick={(e) => e.stopPropagation()}>
        <span className="tabular-nums">{t("club.lightbox.photoOf", { n: index + 1, total: n })}</span>
        <button type="button" onClick={onClose} aria-label={t("club.lightbox.close")} className={btn}><X size={20} /></button>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center py-4">
        <img key={p.url} src={p.url} alt={p.alt ?? ""} className="panel-in max-h-full max-w-full rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
      </div>
      {p.alt && <p className="text-center text-sm text-white/80">{p.alt}</p>}
      {n > 1 && (
        <div className="mt-4 flex justify-center gap-4" onClick={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => go(-1)} aria-label={t("club.lightbox.prev")} className={btn}><ChevronLeft size={22} /></button>
          <button type="button" onClick={() => go(1)} aria-label={t("club.lightbox.next")} className={btn}><ChevronRight size={22} /></button>
        </div>
      )}
    </div>
  );
}