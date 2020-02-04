import React from "react";
import { rpc } from "api/rpc";
// import { isValidAccountAddress } from "components/utils";

interface Params {
  count?: string;
  threshold?: string;
}

export interface Return {
  accountsPending: Account;
  isLoading: boolean;
  isError: boolean;
}

const useAccountPending = (accounts: string[], params: Params): Return => {
  const [accountsPending, setAccountsPending] = React.useState();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  const getAccountsPending = async (accounts: string[]) => {
    setIsError(false);
    setIsLoading(true);

    const json = await rpc("accounts_pending", {
      accounts,
      ...params
    });

    !json || json.error ? setIsError(true) : setAccountsPending(json);
    setIsLoading(false);
  };

  React.useEffect(() => {
    // if (!isValidAccountAddress(accounts)) return;

    // getAccountsPending(accounts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts]);

  return { accountsPending, isLoading, isError };
};

export default useAccountPending;
