import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { analyticsService } from "../services/admin/analyticService.ts";

export function usePageTracking() {
  const { pathname } = useLocation();
  useEffect(() => {
    void analyticsService.trackPageView(pathname);
  }, [pathname]);
}