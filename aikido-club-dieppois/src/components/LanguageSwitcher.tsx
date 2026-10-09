import { useTranslation } from 'react-i18next'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const currentLanguage = i18n.resolvedLanguage ?? 'fr'

  return (
    <div className="language-switcher" aria-label="Language">
      <button
        type="button"
        lang="fr"
        aria-pressed={currentLanguage === 'fr'}
        onClick={() => void i18n.changeLanguage('fr')}
      >
        FR
      </button>

      <span aria-hidden="true">/</span>

      <button
        type="button"
        lang="en"
        aria-pressed={currentLanguage === 'en'}
        onClick={() => void i18n.changeLanguage('en')}
      >
        EN
      </button>
    </div>
  )
}