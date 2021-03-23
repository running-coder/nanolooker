import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Card, Typography } from "antd";
import { isValidAccountAddress } from "components/utils";
import AccountDetails from "./Details";
import AccountDetailsUnopened from "./Details/Unopened";
import AccountPendingHistory from "./Pending";
import AccountHistory from "./History";
import { AccountInfoContext } from "api/contexts/AccountInfo";

import type { PageParams } from "types/page";

const { Text, Title } = Typography;

const AccountPage = () => {
  const { t } = useTranslation();
  const { account = "" } = useParams<PageParams>();
  const { setAccount, isError: isAccountInfoError } = React.useContext(
    AccountInfoContext,
  );
  const isValid = isValidAccountAddress(account);

  React.useEffect(() => {
    setAccount(account);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  return (
    <>
      <Title level={3}>{t("common.account")}</Title>
      {isValid && !isAccountInfoError ? <AccountDetails /> : null}
      {isValid && isAccountInfoError ? <AccountDetailsUnopened /> : null}
      {isValid ? <AccountPendingHistory /> : null}
      {isValid ? <AccountHistory /> : null}

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
