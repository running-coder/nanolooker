import React from "react";
import { useParams } from "react-router-dom";
import { rpc } from "api/rpc";
import { rawToRai } from "components/utils";
import usePrice from "components/Price/hooks/use-price";

interface AccountInfo {
  frontier: string;
  open_block: string;
  representative_block: string;
  balance: string;
  modified_timestamp: string;
  block_count: string;
  confirmation_height: string;
  account_version: string;
}

const AccountPage = () => {
  let { account } = useParams();
  const { usd } = usePrice();
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [accountInfo, setAccountInfo] = React.useState<AccountInfo>();

  React.useEffect(() => {
    const getAccount = async () => {
      try {
        const json = await rpc("account_info", {
          account
        });

        console.log("~~~~json", json);

        setAccountInfo(json);
        setIsLoading(true);
      } catch (e) {}
    };

    getAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  return (
    <>
      <div>Account page - {account || "Missing"}</div>
      {accountInfo ? (
        <>
          <div>balance - {rawToRai(accountInfo.balance)}</div>
          {usd ? <div>usd - ${rawToRai(accountInfo.balance) * usd}</div> : null}
          <div>Total transactions - {accountInfo.block_count}</div>
          <div>Last transaction - {accountInfo.modified_timestamp}</div>
        </>
      ) : null}
    </>
  );
};

export default AccountPage;
