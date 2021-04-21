import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import capitalize from "lodash/capitalize";
import { LOCALSTORAGE_KEYS } from "api/contexts/Preferences";
import { resources } from "./resources";

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
