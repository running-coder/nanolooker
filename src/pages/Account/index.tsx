import React from "react";
import { useParams } from "react-router-dom";
import useAccountInfo from "api/hooks/use-account-info";
import { isValidAccountAddress } from "components/utils";
import AccountHeader from "./Header";
import AccountDetails from "./Details";
import AccountDetailsUnopened from "./Details/Unopened";
import AccountHistory from "./History";
import AccountHistoryEmpty from "./History/Empty";

const AccountPage = () => {
  const { account = "" } = useParams();
  const {
    isError: isAccountInfoError,
    isLoading: isAccountInfoLoading
  } = useAccountInfo(account);
  const isValid = isValidAccountAddress(account);

  return (
    <>
      {isValid ? <AccountHeader /> : null}
      {isValid && !isAccountInfoError && !isAccountInfoLoading ? (
        <>
          <AccountDetails />
          {/* @TODO Add account pending transactions */}
          <AccountHistory />
        </>
      ) : null}
      {isValid && isAccountInfoError && !isAccountInfoLoading ? (
        <>
          <AccountDetailsUnopened />
          <AccountHistoryEmpty />
        </>
      ) : null}
      {isValid && isAccountInfoLoading ? (
        <>
          {/* @TODO Add skeletons */}
          <AccountDetailsUnopened />
          <AccountHistoryEmpty />
        </>
      ) : null}
      {!isValid || !account ? "Missing account" : null}
    </>
  );
};

export default AccountPage;
