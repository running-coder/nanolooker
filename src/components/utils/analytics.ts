import GA4React from "ga-4-react";
import { GA4ReactResolveInterface } from "ga-4-react/dist/models/gtagModels";

const TRACKER = process.env.REACT_APP_GOOGLE_MEASUREMENT_ID;

class Analytics {
  private _ga4: GA4ReactResolveInterface | null;

  constructor() {
    this._ga4 = null;
    if (!TRACKER) return;

    const ga4react = new GA4React(TRACKER);
    ga4react.initialize().then(ga4 => {
      this._ga4 = ga4;
    });
  }

  get ga4() {
    return this._ga4;
  }
}

export const Tracker = new Analytics();
