import React from "react";
import { useTranslation } from "react-i18next";
import { Card, Descriptions, Typography } from "antd";
import { Link } from "react-router-dom";

import exchangeWallets from "./exchanges.json";

const { Title, Text } = Typography;

const WalletTrackerPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Title level={3}>{t("menu.walletTracker")}</Title>
      <Card size="small" bodyStyle={{ padding: 0 }} bordered={false}></Card>
    </>
  );
};

export default WalletTrackerPage;
