import React from "react";

export enum Themes {
  LIGHT = "light",
  DARK = "dark"
}

interface Preferences {
  theme: Themes;
  // @TODO enable ordering?
  cryptocurrency: string[];
  fiat: string;
  setTheme: Function;
  addCryptocurrency: Function;
  removeCryptocurrency: Function;
  setFiat: Function;
}

const THEME_KEY: string = "THEME";
const CRYPTOCURRENCY_KEY: string = "CRYPTOCURRENCY";
const FIAT_KEY: string = "FIAT";

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
  theme: Themes.LIGHT,
  cryptocurrency: [],
  fiat: "usd",
  setTheme: () => {},
  addCryptocurrency: () => {},
  removeCryptocurrency: () => {},
  setFiat: () => {}
});

const Provider: React.FC = ({ children }) => {
  const [theme, setTheme] = React.useState<Themes>(
    (localStorage.getItem(THEME_KEY) as Themes) || Themes.LIGHT
  );
  const [cryptocurrency, setCryptocurrency] = React.useState<string[]>(
    getCryptocurrency()
  );
  const [fiat, setFiat] = React.useState<string>(
    (localStorage.getItem(FIAT_KEY) as Themes) || "usd"
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

  const setLocalstorageTheme = (newTheme: Themes) => {
    localStorage.setItem(THEME_KEY, newTheme);
    setTheme(newTheme);
  };

  const setLocalstorageFiat = (newFiat: string) => {
    localStorage.setItem(FIAT_KEY, newFiat);
    setFiat(newFiat);
  };

  return (
    <PreferencesContext.Provider
      value={{
        theme,
        cryptocurrency,
        fiat,
        setTheme: setLocalstorageTheme,
        addCryptocurrency,
        removeCryptocurrency,
        setFiat: setLocalstorageFiat
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export default Provider;
