import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

export function useInView<T extends Element>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

export function Stagger({ className = "", children }: { className?: string; children: ReactNode }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.12);
  return (
    <div ref={ref} data-in={inView} role="list" className={`stagger ${className}`}>
      {children}
    </div>
  );
}

export const vi = (i: number) => ({ "--i": i }) as CSSProperties;