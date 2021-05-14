import GA4React from "ga-4-react";
import { GA4ReactResolveInterface } from "ga-4-react/dist/models/gtagModels";
import { LOCALSTORAGE_KEYS, Theme, Fiat } from "api/contexts/Preferences";
import { toBoolean } from ".";

const TRACKER = process.env.REACT_APP_GOOGLE_MEASUREMENT_ID;

class Analytics {
  private _ga4: GA4ReactResolveInterface | null;

  constructor() {
    this._ga4 = null;
    if (!TRACKER) return;

    const ga4react = new GA4React(TRACKER);
    ga4react.initialize().then(ga4 => {
      this._ga4 = ga4;

      const userProperties = {
        theme: localStorage.getItem(LOCALSTORAGE_KEYS.THEME) || Theme.LIGHT,
        cryptocurrency: toBoolean(
          JSON.parse(
            localStorage.getItem(LOCALSTORAGE_KEYS.CRYPTOCURRENCY) || "[]",
          ).length,
        ),
        fiat: localStorage.getItem(LOCALSTORAGE_KEYS.FIAT) || Fiat.USD,
        natricon: toBoolean(localStorage.getItem(LOCALSTORAGE_KEYS.NATRICONS)),
        language: localStorage.getItem(LOCALSTORAGE_KEYS.LANGUAGE),
      };

      this._ga4.gtag("set", "user_properties", userProperties);
    });
  }

  get ga4() {
    return this._ga4;
  }
}

export const Tracker = new Analytics();
