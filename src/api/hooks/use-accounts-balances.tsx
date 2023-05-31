import * as React from "react";

import useDeepCompareEffect from "use-deep-compare-effect";

import { rpc } from "api/rpc";
import { isValidAccountAddress } from "components/utils";

export interface AccountsBalances {
  [key: string]: AccountBalance;
}

export type AccountBalance = {
  balance: string;
  pending: string;
};

export interface Return {
  accountsBalances: AccountsBalances | undefined;
  isLoading: boolean;
  isError: boolean;
}

const useAccountsBalances = (accounts: string[]): Return => {
  const [accountsBalances, setAccountsBalance] = React.useState<AccountsBalances>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  const getAccountsBalances = async (accounts: string[]) => {
    setIsError(false);
    setIsLoading(true);

    const json = await rpc("accounts_balances", {
      accounts,
    });

    !json || json.error ? setIsError(true) : setAccountsBalance(json);
    setIsLoading(false);
  };

  useDeepCompareEffect(() => {
    getAccountsBalances(accounts?.filter(account => isValidAccountAddress(account)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts]);

  return { accountsBalances, isLoading, isError };
};

export default useAccountsBalances;
