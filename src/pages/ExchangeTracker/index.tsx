import React from "react";
import { useTranslation } from "react-i18next";
import foreach from "lodash/forEach";
import BigNumber from "bignumber.js";
import { Line, LineConfig } from "@antv/g2plot";
import { Card, Tag, Typography } from "antd";
import { WalletOutlined } from "@ant-design/icons";
import { formatDate, tagColors, lineColors } from "./utils";
import exchangeWallets from "../../exchanges.json";

const { Title } = Typography;

const accountToLineColorMap = exchangeWallets.map(({ account }, i) => ({
  account,
  color: lineColors[i],
}));

let exchangeTrackerChart: any = null;

interface ExchangeBalances {
  [key: string]: ExchangeBalance[];
}

interface ExchangeBalance {
  date: string;
  balance: number;
}

interface LineChartData {
  day: string;
  value: number;
  category: string;
}

const getExchangeBalances = async () => {
  let exchangeBalances: ExchangeBalances = {};

  try {
    const res = await fetch("/api/exchange-tracker");
    exchangeBalances = await res.json();

    let balances: ExchangeBalance[] = [];
    for (let account in exchangeBalances) {
      // eslint-disable-next-line no-loop-func
      foreach(exchangeBalances[account], ({ date, balance }, i) => {
        if (exchangeBalances[account].length >= 360) {
          return false;
        }
        balances.push({ date, balance });
        // If the exchange history is missing dates, fill in the blanks
        // so the balance graph line is vertical and not diagonal
        if (i !== exchangeBalances[account].length - 1) {
          const tomorrow = new Date(date);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const formattedTomorrow = formatDate(tomorrow);
          if (exchangeBalances[account][i + 1].date !== formattedTomorrow) {
            balances.push({
              date: formattedTomorrow,
              balance: exchangeBalances[account][i + 1].balance,
            });
          }
        }
      });
      if (balances.length) {
        exchangeBalances[account] = balances;
      }
      balances = [];
    }

    return exchangeBalances;
  } catch (e) {}

  return exchangeBalances;
};

const ExchangeTrackerPage = () => {
  const { t } = useTranslation();
  // const [isLoading, setIsLoading] = React.useState(true);
  const [activeWallets, setActiveWallets] = React.useState<string[]>(
    exchangeWallets.map(({ account }) => account),
  );
  const [
    exchangeBalances,
    setExchangeBalances,
  ] = React.useState<ExchangeBalances>();
  const [data, setData] = React.useState<LineChartData[]>();

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
    if (!exchangeBalances) return;
    // setIsLoading(true);
    filterData();
    // setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWallets, exchangeBalances]);

  React.useEffect(() => {
    getExchangeBalances().then(balance => {
      setExchangeBalances(balance);
      // setIsLoading(false);
    });

    return () => {
      exchangeTrackerChart = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterData = React.useCallback(() => {
    let data: LineChartData[] = [];

    for (let account in exchangeBalances) {
      if (!activeWallets.includes(account)) continue;

      exchangeBalances[account].forEach(({ date, balance }, i) => {
        data.push({
          day: date,
          value: balance,
          category: account,
        });
      });
    }

    setData(data);
  }, [activeWallets, exchangeBalances]);

  React.useEffect(() => {
    const config: LineConfig = {
      // @ts-ignore
      data,
      xField: "day",
      yField: "value",
      seriesField: "category",
      xAxis: {
        type: "time",
      },
      tooltip: {
        // @ts-ignore
        formatter: (title: string, value: number, name: string) => ({
          title,
          value: new BigNumber(value).toFormat(),
          name:
            exchangeWallets.find(({ account }) => account === name)?.name ||
            name,
        }),
      },
      yAxis: {
        label: {
          formatter: v => new BigNumber(v).toFormat(),
        },
      },
      legend: {
        visible: false,
      },
      // colorField: "type", // or seriesField in some cases
      color: activeWallets.map(
        account =>
          accountToLineColorMap.find(
            ({ account: accountToColor }) => account === accountToColor,
          )?.color || "magenta",
      ),
    };

    if (!exchangeTrackerChart) {
      exchangeTrackerChart = new Line(
        document.getElementById("exchange-tracker-chart") as HTMLElement,
        config,
      );
    } else {
      exchangeTrackerChart.updateConfig(config);
    }

    exchangeTrackerChart.render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <>
      <Title level={3}>{t("menu.exchangeTracker")}</Title>
      <Card size="small" bordered={false}>
        {/* {t("pages.exchangeTracker.description")} */}
        <div>
          {exchangeWallets.map(({ name, account }, index) => {
            const [tagColor, lineColor] = activeWallets.includes(account)
              ? [tagColors[index], lineColors[index]]
              : [];
            return (
              <Tag
                key={account}
                style={{ cursor: "pointer", marginBottom: "8px" }}
                color={tagColor}
                onClick={() => toggleActiveWallet(account)}
              >
                <span style={{ marginRight: "3px" }}>{name}</span>
                <a
                  onClick={e => e.stopPropagation()}
                  style={{
                    display: "inline-block",
                    padding: "0 3px",
                    marginRight: "-3px",
                  }}
                  href={`/account/${account}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WalletOutlined color={lineColor} />
                </a>
              </Tag>
            );
          })}
        </div>

        <div id="exchange-tracker-chart" />
      </Card>
    </>
  );
};

export default ExchangeTrackerPage;
