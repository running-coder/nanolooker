import React from "react";
import { useTranslation } from "react-i18next";
import { Card, Typography } from "antd";

// import exchangeWallets from "./exchanges.json";

const { Title } = Typography;

// const colors = [
//   "magenta",
//   "red",
//   "volcano",
//   "orange",
//   "gold",
//   "lime",
//   "green",
//   "cyan",
//   "blue",
//   "geekblue",
//   "purple",
// ];

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
