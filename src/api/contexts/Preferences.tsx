import React from "react";

export enum Theme {
  LIGHT = "light",
  DARK = "dark"
}

export enum CurrencySymbol {
  usd = "$",
  cad = "$",
  eur = "€"
}

export enum Fiat {
  USD = "usd",
  CAD = "cad",
  EUR = "eur"
}

export enum Language {
  EN = "en",
  FR = "fr"
}

interface Preferences {
  theme: Theme;
  cryptocurrency: string[];
  fiat: Fiat;
  language: Language;
  setTheme: Function;
  addCryptocurrency: Function;
  removeCryptocurrency: Function;
  reorderCryptocurrency: Function;
  setFiat: Function;
  setLanguage: Function;
}

const THEME_KEY: string = "THEME";
const CRYPTOCURRENCY_KEY: string = "CRYPTOCURRENCY";
const FIAT_KEY: string = "FIAT";
const LANGUAGE_KEY: string = "LANGUAGE";

const MAX_CRYPTOCURRENCY: number = 10;

const getCryptocurrency = (): string[] => {
  let preferences;
  try {
    preferences = JSON.parse(
      window.localStorage.getItem(CRYPTOCURRENCY_KEY) || ""
    );
  } catch (_e) {}

  return preferences || [];
};

export const PreferencesContext = React.createContext<Preferences>({
  theme: Theme.LIGHT,
  cryptocurrency: [],
  fiat: Fiat.USD,
  language: Language.EN,
  setTheme: () => {},
  addCryptocurrency: () => {},
  removeCryptocurrency: () => {},
  reorderCryptocurrency: () => {},
  setFiat: () => {},
  setLanguage: () => {}
});

const Provider: React.FC = ({ children }) => {
  const [theme, setTheme] = React.useState<Theme>(
    (localStorage.getItem(THEME_KEY) as Theme) || Theme.LIGHT
  );
  const [cryptocurrency, setCryptocurrency] = React.useState<string[]>(
    getCryptocurrency()
  );
  const [fiat, setFiat] = React.useState<Fiat>(
    (localStorage.getItem(FIAT_KEY) as Fiat) || Fiat.USD
  );
  const [language, setLanguage] = React.useState<Language>(
    (localStorage.getItem(LANGUAGE_KEY) as Language) || Language.EN
  );

  const addCryptocurrency = React.useCallback(
    (value: string) => {
      if (cryptocurrency.includes(value)) return;

      const newCryptocurrency = [value]
        .concat(cryptocurrency)
        .slice(0, MAX_CRYPTOCURRENCY);

      localStorage.setItem(
        CRYPTOCURRENCY_KEY,
        JSON.stringify(newCryptocurrency)
      );

      setCryptocurrency(newCryptocurrency);
    },
    [cryptocurrency]
  );

  const removeCryptocurrency = React.useCallback(
    (value: string) => {
      const newCryptocurrency = cryptocurrency.filter(h => h !== value);
      localStorage.setItem(
        CRYPTOCURRENCY_KEY,
        JSON.stringify(newCryptocurrency)
      );

      setCryptocurrency(newCryptocurrency);
    },
    [cryptocurrency]
  );

  const reorderCryptocurrency = (newOrder: string[]) => {
    localStorage.setItem(CRYPTOCURRENCY_KEY, JSON.stringify(newOrder));

    setCryptocurrency(newOrder);
  };

  const setLocalstorageTheme = (newTheme: Theme) => {
    localStorage.setItem(THEME_KEY, newTheme);
    setTheme(newTheme);
  };

  const setLocalstorageFiat = (newFiat: Fiat) => {
    localStorage.setItem(FIAT_KEY, newFiat);
    setFiat(newFiat);
  };

  const setLocalstorageLanguage = (newLanguage: Language) => {
    localStorage.setItem(LANGUAGE_KEY, newLanguage);
    setLanguage(newLanguage);
  };

  return (
    <PreferencesContext.Provider
      value={{
        theme,
        cryptocurrency,
        fiat,
        language,
        setTheme: setLocalstorageTheme,
        addCryptocurrency,
        removeCryptocurrency,
        reorderCryptocurrency,
        setFiat: setLocalstorageFiat,
        setLanguage: setLocalstorageLanguage
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export default Provider;
