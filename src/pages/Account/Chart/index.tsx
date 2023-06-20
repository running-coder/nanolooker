import * as React from "react";
import { useTranslation } from "react-i18next";

import { Line } from "@antv/g2plot";
import { Card, Empty, Select, Skeleton, Tooltip } from "antd";
import BigNumber from "bignumber.js";
import moment from "moment";
import useDeepCompareEffect from "use-deep-compare-effect";

import { AccountInfoContext } from "api/contexts/AccountInfo";
import useAccountHistory from "api/hooks/use-account-history";
import QuestionCircle from "components/QuestionCircle";
import { intToString, rawToRai } from "components/utils";

const { Option } = Select;

let accountTrackerChart: any = null;

interface ChartData {
  date: string;
  balance: number;
}

enum ChartType {
  DAILY = "DAILY",
  TRANSACTION = "TRANSACTION",
}

const MAX_TRANSACTIONS = 500;
const Chart: React.FC = () => {
  const { t } = useTranslation();
  const [hasData, setHasData] = React.useState(false);
  const [dailyData, setDailyData] = React.useState([] as ChartData[]);
  const [transactionData, setTransactionData] = React.useState([] as ChartData[]);
  const [chartType, setChartType] = React.useState<ChartType>(ChartType.DAILY);
  const {
    account,
    accountInfo,
    isLoading: isAccountInfoLoading,
    isError: isAccountInfoError,
  } = React.useContext(AccountInfoContext);
  const blockCount = parseInt(accountInfo.block_count, 10) || 0;

  const {
    accountHistory: { history },
    isLoading: isAccountHistoryLoading,
  } = useAccountHistory(
    account,
    {
      count: String(MAX_TRANSACTIONS),
      raw: true,
    },
    {
      skip: isAccountInfoLoading || isAccountInfoError,
    },
  );

  React.useEffect(() => {
    if (!account) return;
    accountTrackerChart?.destroy();
    accountTrackerChart = null;
  }, [account]);

  React.useEffect(() => {
    if (isAccountHistoryLoading || !history?.length || !accountInfo?.balance) return;

    let currentBalance = parseInt(accountInfo.balance, 10);
    let dailyData: { [key: string]: number } = {};
    let transactionData: ChartData[] = [];
    let currentDate;

    for (let i = 0; i < history.length; i++) {
      const { subtype, amount, local_timestamp: rawLocalTimestamp } = history[i];
      const localTimestamp = rawLocalTimestamp ? parseInt(rawLocalTimestamp, 10) : null;

      if (!localTimestamp) {
        break;
      }

      if (["send", "receive"].includes(subtype!)) {
        if (!currentDate) {
          currentDate = moment(localTimestamp * 1000)
            .utc()
            .format("YYYY-MM-DD");
          dailyData[currentDate] = currentBalance;

          transactionData.push({
            balance: rawToRai(currentBalance),
            date: `${localTimestamp * 1001}`,
          });
        }

        const date = moment(localTimestamp * 1000)
          .utc()
          .subtract(1, "days")
          .format("YYYY-MM-DD");

        currentBalance = new BigNumber(currentBalance)
          [subtype === "send" ? "plus" : "minus"](amount)
          .toNumber();

        dailyData[date] = currentBalance;

        transactionData.push({
          balance: rawToRai(currentBalance),
          date: `${localTimestamp * 1000}`,
        });
      }
    }

    setDailyData(
      Object.entries(dailyData)
        .map(([date, rawBalance]) => {
          // @NOTE: It may happen that the last date doesn't have all tx due to the TRANSACTIONS_PER_PAGE limit
          let balance = rawToRai(rawBalance);
          if (balance < 0) {
            balance = 0;
          }

          return {
            date,
            balance,
          };
        })
        .reverse() as ChartData[],
    );
    setTransactionData(transactionData.reverse());
  }, [isAccountHistoryLoading, history, accountInfo.balance]);

  useDeepCompareEffect(() => {
    if (!dailyData?.length || !transactionData?.length) return;

    const data = chartType === ChartType.DAILY ? dailyData : transactionData;

    setHasData(data.length > 1);

    const config = {
      data,
      height: 160,
      xField: "date",
      yField: "balance",
      smooth: true,
      xAxis: false,
      tooltip: {
        title: (rawTitle: string) => {
          let title = rawTitle;
          if (chartType === ChartType.TRANSACTION) {
            title = moment(parseInt(title, 10)).utc().format("YYYY-MM-DD");
          }

          return title;
        },
        formatter: ({ balance, date }: { balance: number; date: string }) => {
          return {
            name: t("common.balance"),
            value: `Ӿ ${new BigNumber(balance).toFormat(6)}`,
          };
        },
      },
      yAxis: {
        label: {
          formatter: (a: any) => intToString(parseInt(a)),
        },
        grid: {
          line: {
            style: {
              color: "#f0f2f5",
              lineWidth: 0.5,
            },
          },
        },
      },
    };

    const chartEl = document.getElementById("account-tracker-chart") as HTMLElement;

    chartEl.innerHTML = "";

    accountTrackerChart = new Line(
      chartEl,
      // @ts-ignore
      config,
    );

    accountTrackerChart.render();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailyData, transactionData, chartType]);

  return (
    <Card
      size="small"
      title={t("pages.account.dailyBalance", {
        count: blockCount > MAX_TRANSACTIONS ? MAX_TRANSACTIONS : blockCount,
      })}
      extra={
        <Select
          size="small"
          defaultValue={ChartType.DAILY}
          onChange={setChartType}
          style={{ width: 160 }}
          disabled={!hasData}
        >
          <Option value={ChartType.DAILY}>{t("pages.account.dailyBalanceOption")}</Option>
          <Option value={ChartType.TRANSACTION}>{t("pages.account.byTransactionOption")}</Option>
        </Select>
      }
    >
      <Skeleton active loading={isAccountHistoryLoading}>
        <div id="account-tracker-chart" style={{ display: hasData ? "block" : "none" }} />
      </Skeleton>

      {!isAccountHistoryLoading && !hasData ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: "12px" }}
          description={
            <>
              {t("common.noData")}
              <Tooltip
                placement="top"
                title={<div style={{ marginBottom: "6px" }}>{t("tooltips.dailyBalance")}</div>}
              >
                <QuestionCircle />
              </Tooltip>
            </>
          }
        />
      ) : null}
    </Card>
  );
};

export default Chart;
