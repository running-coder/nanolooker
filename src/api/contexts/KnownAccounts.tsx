import React from "react";

export interface KnownAccount {
  account: string;
  alias: string;
  balance: number;
}

export interface Context {
  knownAccounts: KnownAccount[];
  isLoading: boolean;
  isError: boolean;
}

export const KnownAccountsContext = React.createContext<Context>({
  knownAccounts: [],
  isLoading: false,
  isError: false
});

const Provider: React.FC = ({ children }) => {
  const [knownAccounts, setKnownAccounts] = React.useState(
    [] as KnownAccount[]
  );
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isError, setIsError] = React.useState<boolean>(false);

  const getKnownAccounts = async () => {
    setIsError(false);
    setIsLoading(true);
    const res = await fetch("/api/known-accounts");
    const json = await res.json();

    !json || json.error ? setIsError(true) : setKnownAccounts(json);
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
        isLoading,
        isError
      }}
    >
      {children}
    </KnownAccountsContext.Provider>
  );
};

export default Provider;
