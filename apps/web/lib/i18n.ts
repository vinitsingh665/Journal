import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        'myBuddy.companion.toggleVisibility': 'Toggle Companion',
        'myBuddy.companion.importCta': 'Import Pet',
        'myBuddy.import.title': 'Import',
        'myBuddy.import.choose': 'Choose File',
        'myBuddy.import.replace': 'Replace File',
        'myBuddy.gallery.officialGroup': 'Official Pets',
        'common.close': 'Close',
        'common.delete': 'Delete',
      }
    }
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  parseMissingKeyHandler: (key) => key.split('.').pop()?.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) || key,
});

export default i18n;
