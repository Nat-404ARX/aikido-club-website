import { useCallback, useEffect, useState } from "react";
import { fetchClubPage, type ClubPage } from "../lib/club.ts";

export function useClubPage() {
  const [page, setPage] = useState<ClubPage | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  const reload = useCallback(() => {
    setState("loading");
    fetchClubPage()
      .then((p) => { setPage(p); setState("ready"); })
      .catch(() => setState("error"));
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return { page, state, reload };
}