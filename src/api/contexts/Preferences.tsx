import * as React from "react";

import { DEFAULT_UNITS } from "components/Preferences/FilterTransactions/utils";
import { toBoolean } from "components/utils";

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
  pln = "zł",
}

// https://en.wikipedia.org/wiki/ISO_4217
export enum CurrencyDecimal {
  usd = 2,
  cad = 2,
  eur = 2,
  gbp = 2,
  cny = 2,
  jpy = 0,
  pln = 2,
}

export enum Fiat {
  USD = "usd",
  EUR = "eur",
  CAD = "cad",
  GBP = "gbp",
  CNY = "cny",
  JPY = "jpy",
  PLN = "pln",
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
  nanoQuakeJSUsername: null | string;
  setNanoQuakeJSUsername: Function;
  nanoQuakeJSAccount: null | string;
  setNanoQuakeJSAccount: Function;
  nanoQuakeJSServer: null | string;
  setNanoQuakeJSServer: Function;
  rpcDomain: null | string;
  setRpcDomain: Function;
  websocketDomain: null | string;
  setWebsocketDomain: Function;
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
  BOOKMARKS = "BOOKMARKS",
  NANOQUAKEJS_USERNAME = "NANOQUAKEJS_USERNAME",
  NANOQUAKEJS_ACCOUNT = "NANOQUAKEJS_ACCOUNT",
  NANOQUAKEJS_SERVER = "NANOQUAKEJS_SERVER",
  RPC_DOMAIN = "RPC_DOMAIN",
  WEBSOCKET_DOMAIN = "WEBSOCKET_DOMAIN",
}

const MAX_CRYPTOCURRENCY: number = 10;

const getCryptocurrency = (): string[] => {
  let preferences;
  try {
    preferences = JSON.parse(window.localStorage.getItem(LOCALSTORAGE_KEYS.CRYPTOCURRENCY) || "");
  } catch (_e) {}

  return preferences || [];
};

export const getFilterTransactionsRange = (): [number, number] => {
  let preferences;
  try {
    preferences = JSON.parse(
      window.localStorage.getItem(LOCALSTORAGE_KEYS.FILTER_TRANSACTIONS_RANGE) || "",
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
  nanoQuakeJSUsername: null,
  nanoQuakeJSAccount: null,
  nanoQuakeJSServer: null,
  rpcDomain: null,
  websocketDomain: null,
  setTheme: () => {},
  addCryptocurrency: () => {},
  removeCryptocurrency: () => {},
  reorderCryptocurrency: () => {},
  setFiat: () => {},
  setFilterTransactions: () => {},
  setFilterTransactionsRange: () => {},
  setDisableLiveTransactions: () => {},
  setNatricons: () => {},
  setNanoQuakeJSUsername: () => {},
  setNanoQuakeJSAccount: () => {},
  setNanoQuakeJSServer: () => {},
  setRpcDomain: () => {},
  setWebsocketDomain: () => {},
});

interface Props {
  children: React.ReactNode;
}

const Provider: React.FC<Props> = ({ children }) => {
  const [theme, setTheme] = React.useState<Theme>(
    (localStorage.getItem(LOCALSTORAGE_KEYS.THEME) as Theme) || Theme.LIGHT,
  );
  const [cryptocurrency, setCryptocurrency] = React.useState<string[]>(getCryptocurrency());
  const [fiat, setFiat] = React.useState<Fiat>(
    (localStorage.getItem(LOCALSTORAGE_KEYS.FIAT) as Fiat) || Fiat.USD,
  );
  const [filterTransactions, setFilterTransactions] = React.useState<boolean>(
    toBoolean(localStorage.getItem(LOCALSTORAGE_KEYS.FILTER_TRANSACTIONS)),
  );
  const [filterTransactionsRange, setFilterTransactionsRange] = React.useState(
    getFilterTransactionsRange(),
  );
  const [disableLiveTransactions, setDisableLiveTransactions] = React.useState<boolean>(
    toBoolean(localStorage.getItem(LOCALSTORAGE_KEYS.DISABLE_LIVE_TRANSACTIONS)),
  );
  const [natricons, setNatricons] = React.useState<boolean>(
    toBoolean(localStorage.getItem(LOCALSTORAGE_KEYS.NATRICONS)),
  );
  const [nanoQuakeJSUsername, setNanoQuakeJSUsername] = React.useState(
    localStorage.getItem(LOCALSTORAGE_KEYS.NANOQUAKEJS_USERNAME),
  );
  const [nanoQuakeJSAccount, setNanoQuakeJSAccount] = React.useState(
    localStorage.getItem(LOCALSTORAGE_KEYS.NANOQUAKEJS_ACCOUNT),
  );
  const [nanoQuakeJSServer, setNanoQuakeJSServer] = React.useState(
    localStorage.getItem(LOCALSTORAGE_KEYS.NANOQUAKEJS_SERVER),
  );
  const [rpcDomain, setRpcDomain] = React.useState(
    localStorage.getItem(LOCALSTORAGE_KEYS.RPC_DOMAIN) || "",
  );
  const [websocketDomain, setWebsocketDomain] = React.useState(
    localStorage.getItem(LOCALSTORAGE_KEYS.WEBSOCKET_DOMAIN) || "",
  );

  const addCryptocurrency = React.useCallback(
    (value: string) => {
      if (cryptocurrency.includes(value)) return;

      const newCryptocurrency = [value].concat(cryptocurrency).slice(0, MAX_CRYPTOCURRENCY);

      localStorage.setItem(LOCALSTORAGE_KEYS.CRYPTOCURRENCY, JSON.stringify(newCryptocurrency));

      setCryptocurrency(newCryptocurrency);
    },
    [cryptocurrency],
  );

  const removeCryptocurrency = React.useCallback(
    (value: string) => {
      const newCryptocurrency = cryptocurrency.filter(h => h !== value);
      localStorage.setItem(LOCALSTORAGE_KEYS.CRYPTOCURRENCY, JSON.stringify(newCryptocurrency));

      setCryptocurrency(newCryptocurrency);
    },
    [cryptocurrency],
  );

  const reorderCryptocurrency = (newOrder: string[]) => {
    localStorage.setItem(LOCALSTORAGE_KEYS.CRYPTOCURRENCY, JSON.stringify(newOrder));

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

  const setLocalstorageFilterTransactionsRange = (newValue: [number, number]) => {
    localStorage.setItem(LOCALSTORAGE_KEYS.FILTER_TRANSACTIONS_RANGE, JSON.stringify(newValue));
    setFilterTransactionsRange(newValue);
  };

  const setLocalstorageDisableLiveTransactions = (newValue: boolean) => {
    localStorage.setItem(LOCALSTORAGE_KEYS.DISABLE_LIVE_TRANSACTIONS, `${newValue}`);
    setDisableLiveTransactions(newValue);
  };

  const setLocalstorageNatricons = (newValue: boolean) => {
    localStorage.setItem(LOCALSTORAGE_KEYS.NATRICONS, `${newValue}`);
    setNatricons(newValue);
  };

  const setLocalstorageNanoQuakeJSUsername = (newValue: string) => {
    localStorage.setItem(LOCALSTORAGE_KEYS.NANOQUAKEJS_USERNAME, `${newValue}`);
    setNanoQuakeJSUsername(newValue);
  };

  const setLocalstorageNanoQuakeJSAccount = (newValue: string) => {
    localStorage.setItem(LOCALSTORAGE_KEYS.NANOQUAKEJS_ACCOUNT, `${newValue}`);
    setNanoQuakeJSAccount(newValue);
  };

  const setLocalstorageNanoQuakeJSServer = (newValue: string) => {
    localStorage.setItem(LOCALSTORAGE_KEYS.NANOQUAKEJS_SERVER, `${newValue}`);
    setNanoQuakeJSServer(newValue);
  };

  const setLocalstorageRpcDomain = (newValue: string) => {
    localStorage.setItem(LOCALSTORAGE_KEYS.RPC_DOMAIN, `${newValue}`);
    setRpcDomain(newValue);
  };

  const setLocalstorageWebsocketDomain = (newValue: string) => {
    localStorage.setItem(LOCALSTORAGE_KEYS.WEBSOCKET_DOMAIN, `${newValue}`);
    setWebsocketDomain(newValue);
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
        nanoQuakeJSUsername,
        nanoQuakeJSAccount,
        nanoQuakeJSServer,
        rpcDomain,
        websocketDomain,
        setTheme: setLocalstorageTheme,
        addCryptocurrency,
        removeCryptocurrency,
        reorderCryptocurrency,
        setFiat: setLocalstorageFiat,
        setFilterTransactions: setLocalstorageFilterTransactions,
        setFilterTransactionsRange: setLocalstorageFilterTransactionsRange,
        setDisableLiveTransactions: setLocalstorageDisableLiveTransactions,
        setNatricons: setLocalstorageNatricons,
        setNanoQuakeJSUsername: setLocalstorageNanoQuakeJSUsername,
        setNanoQuakeJSAccount: setLocalstorageNanoQuakeJSAccount,
        setNanoQuakeJSServer: setLocalstorageNanoQuakeJSServer,
        setRpcDomain: setLocalstorageRpcDomain,
        setWebsocketDomain: setLocalstorageWebsocketDomain,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export default Provider;
