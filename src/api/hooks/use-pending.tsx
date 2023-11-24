import * as React from "react";

import KnownAccounts from "knownAccounts.json";

import { rpc } from "api/rpc";
import { isValidAccountAddress } from "components/utils";

const { BURN_ACCOUNT } = KnownAccounts;

interface Params {
  count?: string;
  source?: boolean;
  sorting?: boolean;
  threshold?: string;
  include_only_confirmed?: boolean;
}

interface Response {
  blocks: PendingBlock;
}

export interface PendingBlock {
  amount: string;
  source?: string;
}

export interface Return {
  pending: Response;
  isLoading: boolean;
  isError: boolean;
}

const usePending = (account: string, params: Params): Return => {
  const [pending, setPending] = React.useState({} as any);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  const getPending = async (account: string) => {
    setIsError(false);
    setIsLoading(true);

    try {
      const json = await rpc("pending", {
        account,
        ...params,
      });

      !json || json.error ? setIsError(true) : setPending(json);
    } catch (err) {
      setIsError(true);
    }

    setIsLoading(false);
  };

  React.useEffect(() => {
    // Reset on account change
    setPending({});

    if (!isValidAccountAddress(account) || account === BURN_ACCOUNT) return;

    getPending(account);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  return { pending, isLoading, isError };
};

export default usePending;
