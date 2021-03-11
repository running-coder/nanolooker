import React from "react";
import { useTranslation } from "react-i18next";
import { Line } from "@antv/g2plot";
import { Card, Tag, Typography } from "antd";
import exchangeWallets from "../../exchanges.json";

const { Title } = Typography;

const colors = [
  "magenta",
  "red",
  "volcano",
  "orange",
  "gold",
  "lime",
  "green",
  "cyan",
  "blue",
  "geekblue",
  "purple",
];

const data = [
  {
    day: "2021-03-01",
    value: 144,
    category:
      "nano_3jwrszth46rk1mu7rmb4rhm54us8yg1gw3ipodftqtikf5yqdyr7471nsg1k",
  },
  {
    day: "2021-03-02",
    value: 110,
    category:
      "nano_3jwrszth46rk1mu7rmb4rhm54us8yg1gw3ipodftqtikf5yqdyr7471nsg1k",
  },
  {
    day: "2021-03-03",
    value: 183,
    category:
      "nano_3jwrszth46rk1mu7rmb4rhm54us8yg1gw3ipodftqtikf5yqdyr7471nsg1k",
  },
];

let walletTrackerChart: any = null;

const WalletTrackerPage = () => {
  const { t } = useTranslation();
  const [activeWallets, setActiveWallets] = React.useState<string[]>(
    exchangeWallets.map(({ account }) => account),
  );

  const toggleActiveWallet = (account: string) => {
    if (activeWallets.includes(account)) {
      setActiveWallets(oldActiveWallets =>
        oldActiveWallets.filter(wallet => wallet !== account),
      );
    } else {
      setActiveWallets(oldActiveWallets => [...oldActiveWallets, account]);
    }
  };

  React.useEffect(() => {
    console.log("~~~~1");
    return () => {
      console.log("~~~~3");
      walletTrackerChart = null;
    };
  }, []);

  React.useEffect(() => {
    if (!walletTrackerChart) {
      walletTrackerChart = new Line(
        document.getElementById("wallet-tracker-chart") as HTMLElement,
        {
          data,
          xField: "day",
          yField: "value",
          seriesField: "category",
          xAxis: {
            type: "time",
          },
          yAxis: {
            label: {
              // formatter: v => `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, s => `${s},`),
            },
          },
          legend: {
            visible: false,
          },

          // colorField: "type", // or seriesField in some cases
          color: ["magenta"],
        },
      );
    } else {
      // walletTrackerChart.updateConfig(config);
    }
    console.log("~~~~2 - render");
    walletTrackerChart.render();
  }, [activeWallets]);

  return (
    <>
      <Title level={3}>{t("menu.walletTracker")}</Title>
      <Card size="small" bordered={false}>
        <div>
          {exchangeWallets.map(({ name, account }, index) => (
            <Tag
              key={account}
              style={{ cursor: "pointer", marginBottom: "8px" }}
              color={
                activeWallets.includes(account) ? colors[index] : undefined
              }
              onClick={() => toggleActiveWallet(account)}
            >
              {name}
            </Tag>
          ))}
        </div>

        <div id="wallet-tracker-chart" />
      </Card>
    </>
  );
};

export default WalletTrackerPage;
