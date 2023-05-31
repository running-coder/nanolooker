import * as React from "react";

// import find from "lodash/find";
import useDeepCompareEffect from "use-deep-compare-effect";

import { rpc } from "api/rpc";
import { isValidAccountAddress } from "components/utils";

import type { Subtype, Type } from "types/transaction";

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
  concatHistory?: boolean;
  skip?: boolean;
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
  const [accountHistory, setAccountHistory] = React.useState({} as AccountHistory);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);

  const getAccountHistory = async (account: string, params: AccountHistoryParams) => {
    if (options?.skip) return;

    setIsError(false);
    setIsLoading(true);

    const json = await rpc("account_history", {
      account,
      ...params,
    });

    if (!json || json.error) {
      setIsError(true);
    } else {
      const { history } = json;
      if (options?.concatHistory && json.account === accountHistory.account) {
        json.history = (accountHistory.history || []).concat(history);
      }

      // @NOTE Add `confirmed` on history?
      // const hashes = history && history.map(({ hash }: History) => hash);
      // const { blocks } = await rpc("blocks_info", {
      //   hashes,
      // });

      // // @ts-ignore
      // Object.entries(blocks).forEach(([hash, { confirmed }]) => {
      //   find(json.history, { hash }).confirmed = toBoolean(confirmed);
      // });

      setAccountHistory(json);
    }

    setIsLoading(false);
  };

  React.useEffect(() => {
    // Reset on account change
    setAccountHistory({} as AccountHistory);
  }, [account]);

  useDeepCompareEffect(() => {
    if (!isValidAccountAddress(account) || options?.skip) return;

    getAccountHistory(account, params);
  }, [account, params, options?.skip]);

  return { accountHistory, isLoading, isError };
};

export default useAccountHistory;
