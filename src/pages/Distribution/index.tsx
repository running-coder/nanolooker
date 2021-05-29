import * as React from "react";
import i18next from "i18next";
import { useTranslation, Trans } from "react-i18next";
import { Helmet } from "react-helmet";
import { Card, Switch, Tooltip, Typography } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { StackedColumn, StackedColumnConfig } from "@antv/g2plot";
import useDeepCompareEffect from "use-deep-compare-effect";
import BigNumber from "bignumber.js";
import { KnownAccountsContext } from "api/contexts/KnownAccounts";
import useDistribution, { DistributionIndex } from "api/hooks/use-distribution";
import DormantFunds from "./DormantFunds";
import QuestionCircle from "components/QuestionCircle";
import { intToString } from "components/utils";
import TimeAgo from "timeago-react";

const { Text, Title } = Typography;

// https://medium.com/nanocurrency/the-nano-faucet-c99e18ae1202
// https://docs.nano.org/protocol-design/distribution-and-units/#distribution
// All have been distributed, notes on distribution process...

const distributionMap = [
  "0.001 - <1",
  "1 - <10",
  "10 - <100",
  "100 - <1K",
  "1K - <10K",
  "10K - <100K",
  "100K - <1M",
  "1M - <10M",
  "10M - <100M",
];

let distributionChart: any = null;

const Distribution: React.FC = () => {
  const { t } = useTranslation();
  const {
    knownExchangeAccounts,
    isLoading: isKnownAccountsLoading,
  } = React.useContext(KnownAccountsContext);
  const [isIncludeExchanges, setIsIncludeExchanges] = React.useState<boolean>(
    true,
  );
  const [totalAccounts, setTotalAccounts] = React.useState<number>(0);
  const [totalBalance, setTotalBalance] = React.useState<number>(0);
  const [distributionData, setDistributionData] = React.useState<any[]>([]);
  const [isLogScale, setIsLogScale] = React.useState<boolean>(false);
  const { data } = useDistribution();

  React.useEffect(() => {
    return () => {
      distributionChart = null;
    };
  }, []);

  React.useEffect(() => {
    if (
      !data?.distribution ||
      !data?.knownExchanges ||
      !knownExchangeAccounts.length
    )
      return;

    let knownExchangeDistribution: DistributionIndex[] = [];
    if (!isIncludeExchanges) {
      Object.values(data.knownExchanges).forEach(balance => {
        let index = balance >= 1 ? `${Math.floor(balance)}`.length : 0;

        knownExchangeDistribution[index] = {
          accounts: (knownExchangeDistribution[index]?.accounts || 0) + 1,
          balance: new BigNumber(balance)
            .plus(knownExchangeDistribution[index]?.balance || 0)
            .toNumber(),
        };
      });
    }

    const tmpDistributionData: any[] = [];
    let tmpTotalAccounts = 0;
    let tmpTotalBalance = 0;

    data.distribution.forEach(
      (
        { accounts, balance }: { accounts: number; balance: number },
        i: number,
      ): void => {
        const calcAccounts =
          accounts - (knownExchangeDistribution[i]?.accounts || 0);
        let calcBalance = new BigNumber(balance)
          .minus(knownExchangeDistribution[i]?.balance || 0)
          .toNumber();

        if (calcBalance < 0 && !calcAccounts) {
          calcBalance = 0;
        }

        tmpTotalAccounts += calcAccounts;
        tmpTotalBalance += calcBalance;

        tmpDistributionData.push({
          title: distributionMap[i],
          value: calcBalance,
          type: "balance",
        });
        tmpDistributionData.push({
          title: distributionMap[i],
          value: calcAccounts,
          type: "accounts",
        });
      },
    );

    setTotalAccounts(tmpTotalAccounts);
    setTotalBalance(tmpTotalBalance);
    setDistributionData(tmpDistributionData);
  }, [data, isIncludeExchanges, knownExchangeAccounts]);

  useDeepCompareEffect(() => {
    // @TODO: Validate data: https://nanocharts.info/p/05/balance-distribution
    // https://g2plot.antv.vision/en/examples/column/stacked#connected-area-interaction

    const config: StackedColumnConfig = {
      forceFit: true,
      // responsive: true,
      padding: "auto",
      data: distributionData,
      xField: "title",
      yField: "value",
      stackField: "type",
      yAxis: {
        type: isLogScale ? "log" : "linear",
        min: 0,
        base: 2,
      },
      meta: {
        value: {
          alias: " ",
          formatter: text => {
            return intToString(text);
          },
        },
        title: {
          alias: " ",
        },
      },
      tooltip: {
        // @ts-ignore
        formatter: (title: string, value: number, name: string) => ({
          title,
          value: new BigNumber(value).toFormat(),
          name: name.charAt(0).toUpperCase() + name.slice(1),
        }),
      },
      connectedArea: {
        visible: true,
        // triggerOn: "mouseenter touchstart",
        triggerOn: false,
      },
      legend: {
        visible: true,
        position: "top-center",
        text: {
          style: {
            fontSize: 14,
          },
          formatter: (text: string) =>
            text.charAt(0).toUpperCase() + text.slice(1),
        },
      },
    };

    if (!distributionChart) {
      distributionChart = new StackedColumn(
        document.getElementById("distribution-chart") as HTMLElement,
        config,
      );
    } else {
      distributionChart.updateConfig(config);
    }

    distributionChart.render();
  }, [distributionData, isLogScale]);

  const i18nTotalAccounts = new BigNumber(totalAccounts).toFormat();
  const i18nTotalBalances = new BigNumber(totalBalance).toFormat();
  const knownExchangeList = knownExchangeAccounts
    .map(({ alias }) => alias)
    .join(", ");
  const knownExchangeBalance = new BigNumber(
    knownExchangeAccounts.reduce(
      (acc, { total }) => new BigNumber(acc).plus(total).toNumber(),
      0,
    ),
  ).toFormat();

  const date = data?.status?.date || t("common.notAvailable");

  return (
    <>
      <Helmet>
        <title>Nano {t("menu.distribution")}</title>
      </Helmet>
      <Title level={3}>{t("pages.distribution.title")}</Title>
      <Card size="small">
        <div style={{ marginBottom: "12px" }}>
          <Text style={{ fontSize: "12px" }}>
            {t("common.executionTimeAgo")}{" "}
            <TimeAgo
              locale={i18next.language}
              datetime={date}
              live={false}
              style={{ fontWeight: "bold" }}
            />
          </Text>
          <br />
          <Text style={{ fontSize: "12px" }}>
            <Trans i18nKey="pages.distribution.summary">
              <strong>{{ i18nTotalAccounts }}</strong>
              <strong>{{ i18nTotalBalances }}</strong>
            </Trans>
          </Text>
          <br />
          <Text style={{ fontSize: "12px" }}>
            <Trans i18nKey="pages.distribution.summaryMinBalance">
              <strong />
            </Trans>
          </Text>
        </div>

        <div style={{ marginBottom: "6px" }}>
          <Switch
            disabled={isKnownAccountsLoading}
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            onChange={(checked: boolean) => {
              setIsIncludeExchanges(checked);
            }}
            defaultChecked={isIncludeExchanges}
          />
          <Text style={{ marginLeft: "6px" }}>
            {t("pages.distribution.includeKnownExchanges")}
          </Text>
          <Tooltip
            placement="right"
            title={t("tooltips.knownExchangeBalance", {
              knownExchangeList,
              knownExchangeBalance,
            })}
          >
            <QuestionCircle />
          </Tooltip>
        </div>
        <div style={{ marginBottom: "6px" }}>
          <Switch
            disabled={isKnownAccountsLoading}
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            onChange={(checked: boolean) => {
              setIsLogScale(checked);
            }}
            defaultChecked={isLogScale}
          />
          <Text style={{ margin: "0 6px" }}>
            {t("pages.distribution.logScale")}
          </Text>
        </div>

        <div
          id="distribution-chart"
          style={{
            margin: `0 -24px ${distributionData.length ? "-24px" : "0"} -24px`,
          }}
        ></div>
      </Card>

      <DormantFunds data={data?.dormantFunds} />
    </>
  );
};

export default Distribution;
