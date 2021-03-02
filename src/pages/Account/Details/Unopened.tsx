import React from "react";
import { useTranslation } from "react-i18next";
import { Typography } from "antd";
import { AccountDetailsLayout } from ".";

const { Title } = Typography;

const AccountDetailsUnopened = () => {
  const { t } = useTranslation();
  return (
    <AccountDetailsLayout>
      <div style={{ padding: "12px" }}>
        <Title level={3}>{t("pages.account.notOpenedYet")}</Title>
        <p className="color-muted">{t("pages.account.notOpenedYetReason")}</p>
      </div>
    </AccountDetailsLayout>
  );
};

export default AccountDetailsUnopened;
