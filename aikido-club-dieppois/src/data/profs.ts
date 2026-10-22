import { useTranslation } from "react-i18next";

export const useTeachers = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'cours' });
  return [
    {
      key: "gilles",
      number: "01",
      image: "/assets/images/prof/gilles.png",
    },
    {
      key: "florent",
      number: "02",
      image: "/assets/images/prof/florent.png",
    },
    {
      key: "jose",
      number: "03",
      image: "/assets/images/prof/jose.png",
    },
    {
      key: "patrick",
      number: "04",
      image: "/assets/images/prof/patrick.png",
    },
  ]
};