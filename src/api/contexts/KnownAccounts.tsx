import * as React from "react";
import find from "lodash/find";
import KnownAccounts from "../../knownAccounts.json";
import { BookmarksContext } from "api/contexts/Bookmarks";

const { KNOWN_EXCHANGE_ACCOUNTS } = KnownAccounts;

export interface KnownAccount {
  account: string;
  alias: string;
  balance: number;
  pending: number;
  total: number;
}

export interface Context {
  knownAccounts: KnownAccount[];
  knownExchangeAccounts: KnownAccount[];
  isLoading: boolean;
  isError: boolean;
}

export const KnownAccountsContext = React.createContext<Context>({
  knownAccounts: [],
  knownExchangeAccounts: [],
  isLoading: true,
  isError: false,
});

const Provider: React.FC = ({ children }) => {
  // @TODO Why does using a useEffect on bookmarks does not update the component
  const { bookmarks } = React.useContext(BookmarksContext);
  const [knownAccounts, setKnownAccounts] = React.useState(
    [] as KnownAccount[],
  );
  const [knownExchangeAccounts, setKnownExchangeAccounts] = React.useState(
    [] as KnownAccount[],
  );
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isError, setIsError] = React.useState<boolean>(false);

  const formattedBookmarks = Object.entries(bookmarks?.account || []).map(
    ([account, alias]) => ({ account, alias }),
  );

  const getKnownAccounts = async () => {
    setIsError(false);
    setIsLoading(true);

    try {
      const res = await fetch("/api/known-accounts");
      const json = await res.json();

      !json || json.error ? setIsError(true) : setKnownAccounts(json);

      setKnownExchangeAccounts(
        [...KNOWN_EXCHANGE_ACCOUNTS].map(account =>
          find(json, ["account", account]),
        ),
      );
    } catch (err) {
      setIsError(true);
    }

    setIsLoading(false);
  };

  React.useEffect(() => {
    getKnownAccounts();
  }, []);

  return (
    <KnownAccountsContext.Provider
      value={{
        knownAccounts: knownAccounts.concat(
          formattedBookmarks as KnownAccount[],
        ),
        knownExchangeAccounts,
        isLoading,
        isError,
      }}
    >
      {children}
    </KnownAccountsContext.Provider>
  );
};

export default Provider;
