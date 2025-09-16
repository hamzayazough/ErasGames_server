import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import {getLocales} from 'react-native-localize';
import en from './locales/en.json';
import fr from './locales/fr.json';

// Get device locale
const deviceLocale = getLocales()[0]?.languageCode || 'en';

const resources = {
  en: {translation: en},
  fr: {translation: fr},
};

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: deviceLocale,
  fallbackLng: 'en',
  resources,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
