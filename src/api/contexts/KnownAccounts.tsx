import React from "react";
import find from "lodash/find";
import { KNOWN_EXCHANGE_ACCOUNTS } from "../../knownAccounts.json";

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
  isLoading: false,
  isError: false,
});

const Provider: React.FC = ({ children }) => {
  const [knownAccounts, setKnownAccounts] = React.useState(
    [] as KnownAccount[],
  );
  const [knownExchangeAccounts, setKnownExchangeAccounts] = React.useState(
    [] as KnownAccount[],
  );
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isError, setIsError] = React.useState<boolean>(false);

  const getKnownAccounts = async () => {
    setIsError(false);
    setIsLoading(true);
    const res = await fetch("/api/known-accounts");
    const json = await res.json();

    !json || json.error ? setIsError(true) : setKnownAccounts(json);

    setKnownExchangeAccounts(
      [...KNOWN_EXCHANGE_ACCOUNTS].map(account =>
        find(json, ["account", account]),
      ),
    );

    setIsLoading(false);
  };

  React.useEffect(() => {
    getKnownAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <KnownAccountsContext.Provider
      value={{
        knownAccounts,
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
