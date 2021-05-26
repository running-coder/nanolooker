import * as React from "react";
import { toBoolean } from "components/utils";
import { DEFAULT_UNITS } from "components/Preferences/FilterTransactions/utils";

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

interface Preferences {
  theme: Theme;
  cryptocurrency: string[];
  fiat: Fiat;
  setTheme: Function;
  filterTransactions: boolean;
  filterTransactionsRange: [number, number];
  disableLiveTransactions: boolean;
  addCryptocurrency: Function;
  removeCryptocurrency: Function;
  reorderCryptocurrency: Function;
  setFiat: Function;
  setFilterTransactions: Function;
  setFilterTransactionsRange: Function;
  setDisableLiveTransactions: Function;
  natricons: boolean;
  setNatricons: Function;
}

export enum LOCALSTORAGE_KEYS {
  THEME = "THEME",
  CRYPTOCURRENCY = "CRYPTOCURRENCY",
  FIAT = "FIAT",
  FILTER_TRANSACTIONS = "FILTER_TRANSACTIONS",
  FILTER_TRANSACTIONS_RANGE = "FILTER_TRANSACTIONS_RANGE",
  DISABLE_LIVE_TRANSACTIONS = "DISABLE_LIVE_TRANSACTIONS",
  NATRICONS = "NATRICONS",
  LANGUAGE = "LANGUAGE",
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

const getFilterTransactionsRange = (): [number, number] => {
  let preferences;
  try {
    preferences = JSON.parse(
      window.localStorage.getItem(
        LOCALSTORAGE_KEYS.FILTER_TRANSACTIONS_RANGE,
      ) || "",
    );
  } catch (_e) {}

  if (preferences?.length === 2) {
    if (preferences[0] === null) {
      preferences[0] = Infinity;
    }
    return preferences;
  }

  return DEFAULT_UNITS;
};

export const PreferencesContext = React.createContext<Preferences>({
  theme: Theme.LIGHT,
  cryptocurrency: [],
  fiat: Fiat.USD,
  filterTransactions: false,
  filterTransactionsRange: DEFAULT_UNITS,
  disableLiveTransactions: false,
  natricons: false,
  setTheme: () => {},
  addCryptocurrency: () => {},
  removeCryptocurrency: () => {},
  reorderCryptocurrency: () => {},
  setFiat: () => {},
  setFilterTransactions: () => {},
  setFilterTransactionsRange: () => {},
  setDisableLiveTransactions: () => {},
  setNatricons: () => {},
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
  const [filterTransactions, setFilterTransactions] = React.useState<boolean>(
    toBoolean(localStorage.getItem(LOCALSTORAGE_KEYS.FILTER_TRANSACTIONS)),
  );
  const [filterTransactionsRange, setFilterTransactionsRange] = React.useState(
    getFilterTransactionsRange(),
  );
  const [
    disableLiveTransactions,
    setDisableLiveTransactions,
  ] = React.useState<boolean>(
    toBoolean(
      localStorage.getItem(LOCALSTORAGE_KEYS.DISABLE_LIVE_TRANSACTIONS),
    ),
  );
  const [natricons, setNatricons] = React.useState<boolean>(
    toBoolean(localStorage.getItem(LOCALSTORAGE_KEYS.NATRICONS)),
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

  const setLocalstorageFilterTransactions = (newValue: boolean) => {
    localStorage.setItem(LOCALSTORAGE_KEYS.FILTER_TRANSACTIONS, `${newValue}`);
    setFilterTransactions(newValue);
  };

  const setLocalstorageFilterTransactionsRange = (
    newValue: [number, number],
  ) => {
    localStorage.setItem(
      LOCALSTORAGE_KEYS.FILTER_TRANSACTIONS_RANGE,
      JSON.stringify(newValue),
    );
    setFilterTransactionsRange(newValue);
  };

  const setLocalstorageDisableLiveTransactions = (newValue: boolean) => {
    localStorage.setItem(
      LOCALSTORAGE_KEYS.DISABLE_LIVE_TRANSACTIONS,
      `${newValue}`,
    );
    setDisableLiveTransactions(newValue);
  };

  const setLocalstorageNatricons = (newValue: boolean) => {
    localStorage.setItem(LOCALSTORAGE_KEYS.NATRICONS, `${newValue}`);
    setNatricons(newValue);
  };

  return (
    <PreferencesContext.Provider
      value={{
        theme,
        cryptocurrency,
        fiat,
        filterTransactions,
        filterTransactionsRange,
        disableLiveTransactions,
        natricons,
        setTheme: setLocalstorageTheme,
        addCryptocurrency,
        removeCryptocurrency,
        reorderCryptocurrency,
        setFiat: setLocalstorageFiat,
        setFilterTransactions: setLocalstorageFilterTransactions,
        setFilterTransactionsRange: setLocalstorageFilterTransactionsRange,
        setDisableLiveTransactions: setLocalstorageDisableLiveTransactions,
        setNatricons: setLocalstorageNatricons,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export default Provider;
