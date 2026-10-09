import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './components/LanguageSwitcher'

function App() {
  const { t } = useTranslation()

  return (
    <>
      <header>
        <strong>{t('navigation.home')}</strong>
        <LanguageSwitcher />
      </header>

      <main>
        <p>{t('home.eyebrow')}</p>
        <h1>{t('home.title')}</h1>
        <p>{t('home.subtitle')}</p>

        <a href="#club">{t('home.discover')}</a>

        <section id="club">
          <h2>{t('home.welcomeTitle')}</h2>
          <p>{t('home.welcomeText')}</p>
        </section>
      </main>
    </>
  )
}

export default App