import React from "react";
import { Card, Switch, Tooltip, Typography } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { StackedColumn, StackedColumnConfig } from "@antv/g2plot";
import useDeepCompareEffect from "use-deep-compare-effect";
import BigNumber from "bignumber.js";
import { KnownAccountsContext } from "api/contexts/KnownAccounts";
import useDistribution from "api/hooks/use-distribution";
import QuestionCircle from "components/QuestionCircle";

const { Text, Title } = Typography;

// https://medium.com/nanocurrency/the-nano-faucet-c99e18ae1202
// https://docs.nano.org/protocol-design/distribution-and-units/#distribution
// All have been distributed, notes on distribution process...

const distributionMap = [
  "0.001 - <1",
  "1 - <10",
  "10 - <100",
  "100 - <1k",
  "1k - <10k",
  "10k - <100k",
  "100m - <1m",
  "1m - <10m",
  "10m - <100m",
];

let distributionChart: any = null;

const Distribution = () => {
  const {
    knownExchangeAccounts,
    isLoading: isKnownAccountsLoading,
  } = React.useContext(KnownAccountsContext);
  const [isIncludeExchanges, setIsIncludeExchanges] = React.useState<boolean>(
    true
  );
  const [totalAccounts, setTotalAccounts] = React.useState<number>(0);
  const [totalBalance, setTotalBalance] = React.useState<number>(0);
  const [distributionData, setDistributionData] = React.useState<any[]>([]);
  const [isRendered, setIsRendered] = React.useState<boolean>(false);
  const [isLogScale, setIsLogScale] = React.useState<boolean>(false);
  const distributionChartRef = React.useRef<any>(null);
  const { data } = useDistribution();

  React.useEffect(() => {
    if (!data?.distribution) return;
    const tmpDistributionData: any = [];
    let tmpTotalAccounts = 0;
    let tmpTotalBalance = 0;

    data.distribution.forEach(
      (
        { accounts, balance }: { accounts: number; balance: number },
        i: number
      ): void => {
        // if (i === 0) return;
        tmpTotalAccounts += accounts;
        tmpTotalBalance += balance;
        tmpDistributionData.push({
          title: distributionMap[i],
          value: balance,
          type: "balance",
        });

        tmpDistributionData.push({
          title: distributionMap[i],
          value: accounts,
          type: "accounts",
        });
      }
    );
    setTotalAccounts(tmpTotalAccounts);
    setTotalBalance(tmpTotalBalance);
    setDistributionData(tmpDistributionData);
    setIsRendered(true);
  }, [data]);

  useDeepCompareEffect(() => {
    if (!distributionChartRef?.current || !distributionData.length) return;

    // @TODO: Validate data: https://nanocharts.info/p/05/balance-distribution
    // https://g2plot.antv.vision/en/examples/column/stacked#connected-area-interaction

    const config: StackedColumnConfig = {
      forceFit: true,
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
        distributionChartRef.current,
        config
      );
    } else {
      distributionChart.updateConfig(config);
    }

    distributionChart.render();
  }, [distributionData, distributionChartRef, isRendered, isLogScale]);

  return (
    <>
      <Title level={3}>Nano Distribution</Title>
      <Card>
        <div style={{ marginBottom: "12px" }}>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Total of {new BigNumber(totalAccounts).toFormat()} accounts holding{" "}
            {new BigNumber(totalBalance).toFormat()} NANO are accounted for.
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Any account with a balance lower than 0.001 is excluded.
          </Text>
        </div>
        <div style={{ marginBottom: "6px" }}>
          <Switch
            disabled={true}
            // disabled={isKnownAccountsLoading}
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            onChange={(checked: boolean) => {
              setIsIncludeExchanges(checked);
            }}
            defaultChecked={isIncludeExchanges}
          />
          <Text style={{ margin: "0 6px" }}>
            Include known exchanges accounts
          </Text>
          <Tooltip
            placement="right"
            title={`Exclude ${knownExchangeAccounts
              .map(({ alias }) => alias)
              .join(
                ", "
              )} from the distribution chart. Those accounts combined holds ${new BigNumber(
              knownExchangeAccounts.reduce(
                (acc, { total }) => new BigNumber(acc).plus(total).toNumber(),
                0
              )
            ).toFormat()} NANO`}
            overlayClassName="tooltip-sm"
            style={{ marginLeft: "6px" }}
          >
            <QuestionCircle />
          </Tooltip>
        </div>
        <div>
          <Switch
            disabled={isKnownAccountsLoading}
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            onChange={(checked: boolean) => {
              setIsLogScale(checked);
            }}
            defaultChecked={isLogScale}
          />
          <Text style={{ margin: "0 6px" }}>Log scale</Text>
        </div>

        <div id="container" ref={distributionChartRef}></div>
      </Card>
    </>
  );
};

export default Distribution;
