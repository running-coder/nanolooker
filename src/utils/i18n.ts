import i18n from "i18next";
import { initReactI18next } from "react-i18next";
// import LanguageDetector from "i18next-browser-languagedetector";

// Bundle language files
import en from "./locales/en.json";
import fr from "./locales/fr.json";

i18n
  .use(initReactI18next)
  // .use(LanguageDetector)
  .init({
    lng: localStorage.getItem("LANGUAGE") || undefined,
    fallbackLng: "en",
    resources: {
      en: {
        translation: en,
      },
      fr: {
        translation: fr,
      },
    },
    debug: true,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

export default i18n;
