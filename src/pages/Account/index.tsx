import React from "react";
import { useParams } from "react-router-dom";
import useAccountInfo from "api/hooks/use-account-info";
import { isValidAccountAddress } from "components/utils";
import AccountHeader from "./Header";
import AccountDetails from "./Details";
import AccountHistory from "./History";

const AccountPage = () => {
  const { account = "" } = useParams();
  const { isError: isAccountInfoError } = useAccountInfo(account);

  const isValid = isValidAccountAddress(account);
  return (
    <>
      {isValid && !isAccountInfoError ? (
        <>
          <AccountHeader />
          <AccountDetails />
          <AccountHistory />
        </>
      ) : null}
      {!account ? "Missing account" : null}
      {!isValid ? "This account hasn't been opened yet" : null}
    </>
  );
};

// This account hasn't been opened yet
// While the account address is valid, no blocks have been published to its chain yet.
// If NANO has been sent to this account, it still needs to publish a corresponding block to pocket the funds.

export default AccountPage;
