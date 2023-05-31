import * as React from "react";
import { useTranslation } from "react-i18next";

import { Typography } from "antd";

import { AccountDetailsLayout } from ".";

const { Text, Title } = Typography;

const AccountDetailsUnopened: React.FC = () => {
  const { t } = useTranslation();
  return (
    <AccountDetailsLayout>
      <>
        <Title level={3}>{t("pages.account.notOpenedYet")}</Title>
        <Text className="color-muted">{t("pages.account.notOpenedYetReason")}</Text>
      </>
    </AccountDetailsLayout>
  );
};

export default AccountDetailsUnopened;
