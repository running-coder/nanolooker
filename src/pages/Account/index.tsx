import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Card, Typography } from "antd";
import { isValidAccountAddress } from "components/utils";
import AccountDetails from "./Details";
import AccountDetailsUnopened from "./Details/Unopened";
import AccountPendingHistory from "./Pending";
import AccountHistory from "./History";
import AccountDelegators from "./Delegators";
import { AccountInfoContext } from "api/contexts/AccountInfo";

import type { PageParams } from "types/page";

const { Text, Title } = Typography;

export enum Sections {
  TRANSACTIONS = "transactions",
  DELEGATORS = "delegators",
}

const AccountPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    account = "",
    section = Sections.TRANSACTIONS,
  } = useParams<PageParams>();
  const { setAccount, isError: isAccountInfoError } = React.useContext(
    AccountInfoContext,
  );
  const isValid = isValidAccountAddress(account);

  React.useEffect(() => {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    setAccount(isValid ? account : "");

    return () => setAccount("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  return (
    <>
      <Title level={3}>{t("common.account")}</Title>
      {isValid && !isAccountInfoError ? <AccountDetails /> : null}
      {isValid && isAccountInfoError ? <AccountDetailsUnopened /> : null}
      {isValid && section === Sections.TRANSACTIONS ? (
        <AccountPendingHistory />
      ) : null}

      {isValid && section === Sections.TRANSACTIONS ? <AccountHistory /> : null}
      {isValid && section === Sections.DELEGATORS ? (
        <AccountDelegators />
      ) : null}

      {!isValid || !account ? (
        <Card bordered={false}>
          <Title level={3}>{t("pages.account.missingAccount")}</Title>
          <Text>{t("pages.account.missingAccountInfo")}</Text>
        </Card>
      ) : null}
    </>
  );
};

export default AccountPage;
