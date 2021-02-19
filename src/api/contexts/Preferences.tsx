import React from "react";
import { toBoolean } from "../../components/utils";

export enum Theme {
  LIGHT = "light",
  DARK = "dark",
}

export enum CurrencySymbol {
  usd = "$",
  cad = "$",
  eur = "€",
  gbp = "£",
  cny = "¥",
  jpy = "¥",
}

// https://en.wikipedia.org/wiki/ISO_4217
export enum CurrencyDecimal {
  usd = 2,
  cad = 2,
  eur = 2,
  gbp = 2,
  cny = 2,
  jpy = 0,
}

export enum Fiat {
  USD = "usd",
  CAD = "cad",
  EUR = "eur",
  GBP = "gbp",
  CNY = "cny",
  JPY = "jpy",
}

export enum Language {
  EN = "en",
  FR = "fr",
}

interface Preferences {
  theme: Theme;
  cryptocurrency: string[];
  fiat: Fiat;
  language: Language;
  setTheme: Function;
  hideTransactionsUnderOneNano: boolean;
  disableLiveTransactions: boolean;
  addCryptocurrency: Function;
  removeCryptocurrency: Function;
  reorderCryptocurrency: Function;
  setFiat: Function;
  setLanguage: Function;
  setHideTransactionsUnderOneNano: Function;
  setDisableLiveTransactions: Function;
}

enum LOCALSTORAGE_KEYS {
  THEME = "THEME",
  CRYPTOCURRENCY = "CRYPTOCURRENCY",
  FIAT = "FIAT",
  LANGUAGE = "LANGUAGE",
  HIDE_TRANSACTIONS_UNDER_ONE_NANO = "HIDE_TRANSACTIONS_UNDER_ONE_NANO",
  DISABLE_LIVE_TRANSACTIONS = "DISABLE_LIVE_TRANSACTIONS",
}

const MAX_CRYPTOCURRENCY: number = 10;

const getCryptocurrency = (): string[] => {
  let preferences;
  try {
    preferences = JSON.parse(
      window.localStorage.getItem(LOCALSTORAGE_KEYS.CRYPTOCURRENCY) || "",
    );
  } catch (_e) {}

  return preferences || [];
};

export const PreferencesContext = React.createContext<Preferences>({
  theme: Theme.LIGHT,
  cryptocurrency: [],
  fiat: Fiat.USD,
  language: Language.EN,
  hideTransactionsUnderOneNano: false,
  disableLiveTransactions: false,
  setTheme: () => {},
  addCryptocurrency: () => {},
  removeCryptocurrency: () => {},
  reorderCryptocurrency: () => {},
  setFiat: () => {},
  setLanguage: () => {},
  setHideTransactionsUnderOneNano: () => {},
  setDisableLiveTransactions: () => {},
});

const Provider: React.FC = ({ children }) => {
  const [theme, setTheme] = React.useState<Theme>(
    (localStorage.getItem(LOCALSTORAGE_KEYS.THEME) as Theme) || Theme.LIGHT,
  );
  const [cryptocurrency, setCryptocurrency] = React.useState<string[]>(
    getCryptocurrency(),
  );
  const [fiat, setFiat] = React.useState<Fiat>(
    (localStorage.getItem(LOCALSTORAGE_KEYS.FIAT) as Fiat) || Fiat.USD,
  );
  const [language, setLanguage] = React.useState<Language>(
    (localStorage.getItem(LOCALSTORAGE_KEYS.LANGUAGE) as Language) ||
      Language.EN,
  );
  const [
    hideTransactionsUnderOneNano,
    setHideTransactionsUnderOneNano,
  ] = React.useState<boolean>(
    toBoolean(
      localStorage.getItem(LOCALSTORAGE_KEYS.HIDE_TRANSACTIONS_UNDER_ONE_NANO),
    ),
  );
  const [disableLiveTransactions, setDisableLiveTransactions] = React.useState<
    boolean
  >(
    toBoolean(
      localStorage.getItem(LOCALSTORAGE_KEYS.DISABLE_LIVE_TRANSACTIONS),
    ),
  );

  const addCryptocurrency = React.useCallback(
    (value: string) => {
      if (cryptocurrency.includes(value)) return;

      const newCryptocurrency = [value]
        .concat(cryptocurrency)
        .slice(0, MAX_CRYPTOCURRENCY);

      localStorage.setItem(
        LOCALSTORAGE_KEYS.CRYPTOCURRENCY,
        JSON.stringify(newCryptocurrency),
      );

      setCryptocurrency(newCryptocurrency);
    },
    [cryptocurrency],
  );

  const removeCryptocurrency = React.useCallback(
    (value: string) => {
      const newCryptocurrency = cryptocurrency.filter(h => h !== value);
      localStorage.setItem(
        LOCALSTORAGE_KEYS.CRYPTOCURRENCY,
        JSON.stringify(newCryptocurrency),
      );

      setCryptocurrency(newCryptocurrency);
    },
    [cryptocurrency],
  );

  const reorderCryptocurrency = (newOrder: string[]) => {
    localStorage.setItem(
      LOCALSTORAGE_KEYS.CRYPTOCURRENCY,
      JSON.stringify(newOrder),
    );

    setCryptocurrency(newOrder);
  };

  const setLocalstorageTheme = (newValue: Theme) => {
    localStorage.setItem(LOCALSTORAGE_KEYS.THEME, newValue);
    setTheme(newValue);
  };

  const setLocalstorageFiat = (newValue: Fiat) => {
    localStorage.setItem(LOCALSTORAGE_KEYS.FIAT, newValue);
    setFiat(newValue);
  };

  const setLocalstorageLanguage = (newValue: Language) => {
    localStorage.setItem(LOCALSTORAGE_KEYS.LANGUAGE, newValue);
    setLanguage(newValue);
  };

  const setLocalstorageHideTransactionsUnderOneNano = (newValue: boolean) => {
    localStorage.setItem(
      LOCALSTORAGE_KEYS.HIDE_TRANSACTIONS_UNDER_ONE_NANO,
      `${newValue}`,
    );
    setHideTransactionsUnderOneNano(newValue);
  };

  const setLocalstorageDisableLiveTransactions = (newValue: boolean) => {
    localStorage.setItem(
      LOCALSTORAGE_KEYS.DISABLE_LIVE_TRANSACTIONS,
      `${newValue}`,
    );
    setDisableLiveTransactions(newValue);
  };

  return (
    <PreferencesContext.Provider
      value={{
        theme,
        cryptocurrency,
        fiat,
        language,
        hideTransactionsUnderOneNano,
        disableLiveTransactions,
        setTheme: setLocalstorageTheme,
        addCryptocurrency,
        removeCryptocurrency,
        reorderCryptocurrency,
        setFiat: setLocalstorageFiat,
        setLanguage: setLocalstorageLanguage,
        setHideTransactionsUnderOneNano: setLocalstorageHideTransactionsUnderOneNano,
        setDisableLiveTransactions: setLocalstorageDisableLiveTransactions,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export default Provider;
