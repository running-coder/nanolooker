import * as React from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";

import { WalletOutlined } from "@ant-design/icons";
import { Line } from "@antv/g2plot";
import { Card, Tag, Typography } from "antd";
import BigNumber from "bignumber.js";
import foreach from "lodash/forEach";
import orderBy from "lodash/orderBy";
import moment from "moment";

import LoadingStatistic from "components/LoadingStatistic";

import exchangeWallets from "../../exchanges.json";
import { lineColors, tagColors } from "./utils";

const { Text, Title } = Typography;

const accountToLineColorMap = exchangeWallets.map(({ account }, i) => ({
  account,
  color: lineColors[i % lineColors.length],
}));
accountToLineColorMap.push({
  account: "ALL",
  color: lineColors[lineColors.length - 1],
});

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
        balances.push({ date, balance });

        // If the exchange history is missing dates, fill in the blanks
        // so the balance graph line is vertical and not diagonal
        if (i !== exchangeBalances[account].length - 1) {
          let tomorrow = moment(date).add(1, "days").format("YYYY-MM-DD");

          while (!tomorrow.startsWith(exchangeBalances[account][i + 1].date)) {
            balances.push({
              date: tomorrow,
              balance: exchangeBalances[account][i].balance,
            });

            tomorrow = moment(tomorrow).add(1, "days").format("YYYY-MM-DD");
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

const ExchangeTrackerPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeWallets, setActiveWallets] = React.useState<string[]>(
    exchangeWallets
      .map(({ account, name }) => (!name.toLowerCase().includes("cold") ? account : ""))
      .filter(Boolean),
  );
  const [exchangeBalances, setExchangeBalances] = React.useState<ExchangeBalances>();
  const [data, setData] = React.useState<LineChartData[]>();
  const [totalExchangeBalance, setTotalExchangeBalance] = React.useState(0);
  const [isSelectedExchanges, setIsSelectedExchanges] = React.useState(false);

  const toggleActiveWallet = (account: string) => {
    if (activeWallets.includes(account)) {
      setActiveWallets(oldActiveWallets => oldActiveWallets.filter(wallet => wallet !== account));
    } else {
      setActiveWallets(oldActiveWallets => [...oldActiveWallets, account]);
    }
  };

  React.useEffect(() => {
    if (!exchangeBalances) return;
    filterData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWallets, exchangeBalances, isSelectedExchanges]);

  React.useEffect(() => {
    getExchangeBalances().then(balance => {
      setExchangeBalances(balance);
      // setIsLoading(false);
    });

    return () => {
      exchangeTrackerChart?.destroy();
      exchangeTrackerChart = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterData = React.useCallback(() => {
    let data: LineChartData[] = [];
    let exchangeData: { [key: string]: any } = {};

    const lastExchangeValues: { [key: string]: number } = {};

    let totalExchangeBalance = 0;
    for (let account in exchangeBalances) {
      if (!activeWallets.includes(account)) continue;

      lastExchangeValues[account] = 0;

      // eslint-disable-next-line no-loop-func
      exchangeBalances[account].forEach(({ date, balance }, index) => {
        const day = date.replace(/T.+/, "");

        const value = balance < 1 ? 0 : balance;

        data.push({
          day,
          value,
          category: account,
        });

        if (isSelectedExchanges) {
          if (exchangeData[day]) {
            exchangeData[day].value = new BigNumber(exchangeData[day].value).plus(value).toNumber();
          } else {
            exchangeData[day] = {
              day,
              value,
              category: "ALL",
            };
          }
        }
      });

      totalExchangeBalance = new BigNumber(totalExchangeBalance)
        .plus(data[data.length - 1]?.value || 0)
        .toNumber();
    }

    const orderedExchangeData = orderBy(Object.values(exchangeData), ["day"], ["asc"]).filter(
      ({ value }) => !!value,
    );

    const combinedData = data.concat(orderedExchangeData);

    setTotalExchangeBalance(totalExchangeBalance);
    setData(combinedData);
  }, [activeWallets, exchangeBalances, isSelectedExchanges]);

  React.useEffect(() => {
    if (!data?.length) return;

    const config = {
      data,
      xField: "day",
      yField: "value",
      seriesField: "category",
      xAxis: {
        type: "time",
      },
      tooltip: {
        // @ts-ignore
        customItems: (originalItems: any) => {
          // @ts-ignore
          const items = originalItems.map(data => {
            let { name, value, ...rest } = data;

            if (name === "ALL") {
              name = t("pages.exchangeTracker.selectedWallets");
            } else {
              name = exchangeWallets.find(({ account }) => account === name)?.name || name;
            }

            return {
              ...rest,
              name,
              value: new BigNumber(value).toFormat(),
            };
          });

          return items;
        },
      },
      yAxis: {
        label: {
          formatter: (value: string) => `${new BigNumber(value).dividedBy(1000000).toFormat()}M`,
        },
      },
      legend: {
        visible: false,
      },
      color: accountToLineColorMap
        .map(({ account, color }) => (activeWallets.includes(account) ? color : undefined))
        .filter(Boolean),
    };

    if (!exchangeTrackerChart) {
      exchangeTrackerChart = new Line(
        document.getElementById("exchange-tracker-chart") as HTMLElement,
        // @ts-ignore
        config,
      );

      exchangeTrackerChart.render();
    } else {
      exchangeTrackerChart.update(config);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <>
      <Helmet>
        <title>Nano {t("menu.exchangeTracker")}</title>
      </Helmet>
      <Title level={3}>{t("menu.exchangeTracker")}</Title>

      <Card size="small">
        <div style={{ marginBottom: "12px" }}>
          <Text style={{ fontSize: "12px" }}>{t("pages.exchangeTracker.description")}</Text>
        </div>
        <div>
          {exchangeWallets.map(({ name, account }, index) => {
            const [tagColor, lineColor] = activeWallets.includes(account)
              ? [tagColors[index % tagColors.length], lineColors[index % lineColors.length]]
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

        <div>
          <Tag
            style={{ cursor: "pointer", marginBottom: "8px" }}
            color={
              isSelectedExchanges ? tagColors[(tagColors.length - 1) % tagColors.length] : "default"
            }
            onClick={() => {
              setIsSelectedExchanges(!isSelectedExchanges);
              toggleActiveWallet("ALL");
            }}
          >
            <span style={{ marginRight: "3px" }}>
              {t("pages.exchangeTracker.selectedWallets")} (
              {activeWallets.filter(account => account !== "ALL").length})
            </span>
          </Tag>
        </div>

        <LoadingStatistic
          title={t("pages.exchangeTracker.totalSelected")}
          prefix="Ӿ"
          value={totalExchangeBalance}
          isLoading={!exchangeBalances}
        />

        <div id="exchange-tracker-chart" />
      </Card>
    </>
  );
};

export default ExchangeTrackerPage;
