import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  defaultPricing,
  pricingService,
  type PricingPlan,
} from "../services/princingService.ts";

export const usePricing = () => {
  const { t } = useTranslation("translation", {
    keyPrefix: "cours",
  });

  const [pricing, setPricing] = useState(defaultPricing);

  useEffect(() => {
    let active = true;

    pricingService
      .get()
      .then((data) => {
        if (active) setPricing(data);
      })
      .catch((error: unknown) => {
        console.error("Erreur de chargement des tarifs :", error);
      });

    return () => {
      active = false;
    };
  }, []);

  return [
    {
      season: pricing.season,
      pdf: pricing.pdf_url,
      plans: pricing.plans.map((plan: PricingPlan) => ({
        ...plan,
        name: plan.key === "adult" ? t("maj") : t("min"),
      })),
    },
  ];
};
