import React from "react";
import { rpc } from "api/rpc";
import { isValidAccountAddress } from "components/utils";

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

    const json = await rpc("pending", {
      account,
      ...params,
    });

    !json || json.error ? setIsError(true) : setPending(json);
    setIsLoading(false);
  };

  React.useEffect(() => {
    if (!isValidAccountAddress(account)) return;

    getPending(account);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  return { pending, isLoading, isError };
};

export default usePending;
