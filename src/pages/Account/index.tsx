import * as React from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { Card, Typography } from "antd";

import { AccountInfoContext } from "api/contexts/AccountInfo";
import { isValidAccountAddress } from "components/utils";

import AccountDelegators from "./Delegators";
import AccountDetails from "./Details";
import AccountDetailsUnopened from "./Details/Unopened";
import AccountHistory from "./History";
import useSockets from "./hooks/use-socket";
import AccountPendingHistory from "./Pending";

import type { PageParams } from "types/page";

const { Text, Title } = Typography;

export enum Sections {
  TRANSACTIONS = "transactions",
  DELEGATORS = "delegators",
}

const AccountPage: React.FC = () => {
  const { t } = useTranslation();
  const { account = "", section = Sections.TRANSACTIONS } = useParams<PageParams>();
  const { setAccount, isError: isAccountInfoError } = React.useContext(AccountInfoContext);
  const isValid = isValidAccountAddress(account);
  const {
    transactions: socketTransactions,
    pendingTransactions: pendingSocketTransactions,
    balance: socketBalance,
    pendingBalance: socketPendingBalance,
  } = useSockets({ account });

  const updateCount = socketTransactions.length + pendingSocketTransactions.length;

  React.useEffect(() => {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    setAccount(isValid ? account : "");

    return () => setAccount("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  return (
    <>
      <Helmet>
        <title>
          {updateCount ? `(${updateCount}) ` : ""}
          {t("common.account")} {account}
        </title>
      </Helmet>
      <Title level={3}>{t("common.account")}</Title>
      {isValid && !isAccountInfoError ? (
        <AccountDetails
          socketTransactions={socketTransactions}
          socketBalance={socketBalance}
          socketPendingBalance={socketPendingBalance}
        />
      ) : null}
      {isValid && isAccountInfoError ? <AccountDetailsUnopened /> : null}
      {isValid && section === Sections.TRANSACTIONS ? (
        <AccountPendingHistory
          socketTransactions={socketTransactions}
          pendingSocketTransactions={pendingSocketTransactions}
        />
      ) : null}

      {isValid && section === Sections.TRANSACTIONS ? (
        <AccountHistory socketTransactions={socketTransactions} />
      ) : null}
      {isValid && section === Sections.DELEGATORS ? <AccountDelegators /> : null}

      {!isValid || !account ? (
        <Card>
          <Title level={3}>{t("pages.account.missingAccount")}</Title>
          <Text>{t("pages.account.missingAccountInfo")}</Text>
        </Card>
      ) : null}
    </>
  );
};

export default AccountPage;
