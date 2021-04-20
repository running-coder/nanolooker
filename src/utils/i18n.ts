import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import capitalize from "lodash/capitalize";
import { LOCALSTORAGE_KEYS } from "api/contexts/Preferences";

// Bundle language files
import en from "./locales/en.json";
import fr from "./locales/fr.json";
import es from "./locales/es.json";
import ar from "./locales/ar.json";
import de from "./locales/de.json";
import hi from "./locales/hi.json";
import it from "./locales/it.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";
import nl from "./locales/nl.json";
import pt from "./locales/pt.json";
import ru from "./locales/ru.json";
import zh from "./locales/zh.json";

const resources = {
  en: {
    translation: en,
  },
  fr: {
    translation: fr,
  },
  es: {
    translation: es,
  },
  ar: {
    translation: ar,
  },
  de: {
    translation: de,
  },
  hi: {
    translation: hi,
  },
  it: {
    translation: it,
  },
  ja: {
    translation: ja,
  },
  ko: {
    translation: ko,
  },
  nl: {
    translation: nl,
  },
  pt: {
    translation: pt,
  },
  ru: {
    translation: ru,
  },
  zh: {
    translation: zh,
  },
};

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    detection: { lookupLocalStorage: LOCALSTORAGE_KEYS.LANGUAGE },
    lng: localStorage.getItem(LOCALSTORAGE_KEYS.LANGUAGE) || undefined,
    fallbackLng: "en",
    supportedLngs: Object.keys(resources),
    resources,
    debug: true,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
      format: function (value, format, lng) {
        if (format === "capitalize") return capitalize(value);
        return value;
      },
    },
  });

export default i18n;
