import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { readJson } from '@/shared/lib/storage'
import en from './locales/en.json'
import ru from './locales/ru.json'
import uz from './locales/uz.json'

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ru: { translation: ru }, uz: { translation: uz } },
  lng: readJson<string>('pedicare.lang') ?? 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
