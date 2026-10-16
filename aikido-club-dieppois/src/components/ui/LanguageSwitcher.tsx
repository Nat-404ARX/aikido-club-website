import { useTranslation } from "react-i18next";

const languages = [
  { code: "fr", label: "Français", shortLabel: "FR" },
  { code: "en", label: "English", shortLabel: "EN" },
] as const;

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const currentLanguage = i18n.resolvedLanguage?.split("-")[0] ?? "fr";

  async function changeLanguage(language: string) {
    await i18n.changeLanguage(language);
  }

  return (
    <div className="relative inline-flex items-center">
      <label htmlFor="language-select" className="sr-only">
        {t("nav.language")}
      </label>
      


      <select
        id="language-select"
        value={currentLanguage}
        onChange={(event) => void changeLanguage(event.target.value)}
        className="min-h-8 cursor-pointer appearance-none rounded-md border border-current/15 bg-transparent py-2 pl-7 pr-6 text-sm transition-colors hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {languages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.shortLabel}
          </option>
        ))}
      </select>
    </div>
  );
}

