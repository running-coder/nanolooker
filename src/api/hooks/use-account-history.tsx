import React from "react";
import { rpc } from "api/rpc";
import { isValidAccountAddress } from "components/utils";

interface History {
  type: "state" | "pending" | "send" | "receive";
  subtype?: "pending" | "send" | "receive";
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

export interface UsePeersReturn {
  accountHistory: AccountHistory;
  isError: boolean;
}

const useAccountHistory = (
  account: string,
  params: AccountHistoryParams
): UsePeersReturn => {
  const [accountHistory, setAccountHistory] = React.useState(
    {} as AccountHistory
  );
  const [isError, setIsError] = React.useState(false);

  const getAccountHistory = async (
    account: string,
    params: AccountHistoryParams
  ) => {
    const json = await rpc("account_history", {
      account,
      ...params
    });

    !json || json.error ? setIsError(true) : setAccountHistory(json);
  };

  React.useEffect(() => {
    if (!isValidAccountAddress(account)) return;

    getAccountHistory(account, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, params.offset]);

  return { accountHistory, isError };
};

export default useAccountHistory;
