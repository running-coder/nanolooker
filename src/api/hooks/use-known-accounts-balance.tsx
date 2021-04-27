import * as React from "react";

export interface KnownAccountsBalance {
  account: string;
  alias: string;
  balance: number;
  pending: number;
  total: number;
}

export interface Return {
  knownAccountsBalance: KnownAccountsBalance[];
  isLoading: boolean;
  isError: boolean;
}

const useKnownAccountsBalance = (): Return => {
  const [knownAccountsBalance, setKnownAccountsBalance] = React.useState(
    [] as KnownAccountsBalance[],
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  const getKnownAccountsBalance = async () => {
    setIsError(false);
    setIsLoading(true);

    try {
      const res = await fetch("/api/known-accounts-balance");
      const json = await res.json();

      !json || json.error ? setIsError(true) : setKnownAccountsBalance(json);
    } catch (err) {
      setIsError(true);
    }
    setIsLoading(false);
  };

  React.useEffect(() => {
    getKnownAccountsBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { knownAccountsBalance, isLoading, isError };
};

export default useKnownAccountsBalance;
