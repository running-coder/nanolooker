import React from "react";
import { rpc } from "api/rpc";
import { isValidAccountAddress } from "components/utils";

export interface AccountInfo {
  frontier: string;
  open_block: string;
  representative_block: string;
  balance: string;
  modified_timestamp: string;
  block_count: string;
  representative: string;
  weight?: string;
  pending: string;
  confirmation_height: string;
  account_version: string;
}

export interface UsePeersReturn {
  accountInfo: AccountInfo;
  isError: boolean;
  isLoading: boolean;
}

const useAccountInfo = (account?: string): UsePeersReturn => {
  const [accountInfo, setAccountInfo] = React.useState({} as AccountInfo);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  const getAccountInfo = async (account: string) => {
    setIsError(false);
    setIsLoading(true);
    const json = await rpc("account_info", {
      account,
      representative: "true",
      pending: "true"
    });

    !json || json.error ? setIsError(true) : setAccountInfo(json);
    setIsLoading(false);
  };

  React.useEffect(() => {
    if (!account || !isValidAccountAddress(account)) return;
    console.log("~~~~~~ACCOUNT!?!?!?!? -----", account);
    getAccountInfo(account);
  }, [account]);

  return { accountInfo, isLoading, isError };
};

export default useAccountInfo;
