import React from "react";
import { rpc } from "api/rpc";
import { isValidAccountAddress } from "components/utils";

export interface AccountInfoRPCResponse {
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

export interface AccountInfoReturn {
  account: string;
  setAccount: Function;
  accountInfo: AccountInfoRPCResponse;
  isLoading: boolean;
  isError: boolean;
}

export const AccountInfoContext = React.createContext<AccountInfoReturn>({
  account: "",
  setAccount: () => {},
  accountInfo: {} as AccountInfoRPCResponse,
  isLoading: false,
  isError: false
});

const Provider: React.FunctionComponent = ({ children }) => {
  const [account, setAccount] = React.useState<string>("");
  const [accountInfo, setAccountInfo] = React.useState(
    {} as AccountInfoRPCResponse
  );
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
    if (account && isValidAccountAddress(account)) {
      getAccountInfo(account);
    }
  }, [account]);

  return (
    <AccountInfoContext.Provider
      value={{ account, setAccount, accountInfo, isLoading, isError }}
    >
      {children}
    </AccountInfoContext.Provider>
  );
};

export default Provider;
