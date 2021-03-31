import React from "react";
import useDeepCompareEffect from "use-deep-compare-effect";
import { rpc } from "api/rpc";
import { isValidAccountAddress } from "components/utils";

import type { Type, Subtype } from "types/transaction";

interface History {
  type: Type;
  subtype?: Subtype;
  representative: string;
  account: string;
  amount: string;
  local_timestamp: string;
  height: string;
  hash: string;
}

export interface AccountHistory {
  account: string;
  history: History[];
  previous: string;
}

interface AccountHistoryParams {
  count?: string;
  raw?: boolean;
  head?: string;
  offset?: number;
  reverse?: boolean;
  account_filter?: string[];
}

interface AccountHistoryOptions {
  concatHistory: boolean;
}
export interface UseAccountHistoryReturn {
  accountHistory: AccountHistory;
  isLoading: boolean;
  isError: boolean;
}

const useAccountHistory = (
  account: string,
  params: AccountHistoryParams,
  options?: AccountHistoryOptions,
): UseAccountHistoryReturn => {
  const [accountHistory, setAccountHistory] = React.useState(
    {} as AccountHistory,
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  const getAccountHistory = async (
    account: string,
    params: AccountHistoryParams,
  ) => {
    setIsError(false);
    setIsLoading(true);

    const json = await rpc("account_history", {
      account,
      ...params,
    });

    if (!json || json.error) {
      setIsError(true);
    } else {
      if (options?.concatHistory && json.account === accountHistory.account) {
        json.history = (accountHistory.history || []).concat(json.history);
      }
      setAccountHistory(json);
    }

    setIsLoading(false);
  };

  useDeepCompareEffect(() => {
    if (!isValidAccountAddress(account)) return;
    getAccountHistory(account, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, params]);

  return { accountHistory, isLoading, isError };
};

export default useAccountHistory;
