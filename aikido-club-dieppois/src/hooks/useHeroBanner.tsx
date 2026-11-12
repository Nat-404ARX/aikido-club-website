import { useCallback, useEffect, useState } from "react";
import {
  getHeroBanner,
  type HeroBannerData,
} from "../services/herobannerService.ts";

export function useHeroBanner() {
  const [banner, setBanner] = useState<HeroBannerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getHeroBanner();
      setBanner(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Impossible de charger la bannière.")
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function fetchBanner() {
      try {
        const data = await getHeroBanner();

        if (active) {
          setBanner(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err
              : new Error("Impossible de charger la bannière.")
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    fetchBanner();

    return () => {
      active = false;
    };
  }, []);

  return {
    banner,
    isLoading,
    error,
    reload: load,
  };
}
