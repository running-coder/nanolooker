import React from "react";
import { useParams } from "react-router-dom";
import { isValidAccountAddress } from "components/utils";
import AccountHeader from "./Header";
import AccountDetails from "./Details";
import AccountDetailsUnopened from "./Details/Unopened";
import AccountPendingHistory from "./Pending";
import AccountHistory from "./History";
import { AccountInfoContext } from "api/contexts/AccountInfo";

const AccountPage = () => {
  console.log("render????");
  const { account = "" } = useParams();
  const { setAccount, isError: isAccountInfoError } = React.useContext(
    AccountInfoContext
  );
  const isValid = isValidAccountAddress(account);

  React.useEffect(() => {
    setAccount(account);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  return (
    <>
      {isValid ? <AccountHeader /> : null}
      {isValid && !isAccountInfoError ? (
        <>
          <AccountDetails />
          {/* @TODO Add account pending transactions THIS CONDITION RE-RENDERS 2 times... possible isError + loading... :pepethink: */}
        </>
      ) : null}
      {isValid && isAccountInfoError ? (
        <>
          <AccountDetailsUnopened />
        </>
      ) : null}

      {/* @TODO Limit RPC call to single */}
      <AccountPendingHistory />
      <AccountHistory />
      {!isValid || !account ? "Missing account" : null}
    </>
  );
};

export default AccountPage;
