import * as React from "react";
import { useTranslation } from "react-i18next";
import find from "lodash/find";
import { Card, Slider, Typography } from "antd";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import BigNumber from "bignumber.js";
import useFrontierCount from "api/hooks/use-frontier-count";
import useAvailableSupply from "api/hooks/use-available-supply";

const { Text, Title } = Typography;

let dormantFundsByRange: any = {};

interface Props {
  data: any;
}

const DormantFunds: React.FC<Props> = ({ data }) => {
  const { t } = useTranslation();
  const [marks, setMarks] = React.useState({});
  const [totalFunds, setTotalFunds] = React.useState<number>(0);
  const [unknownDormantFunds, setUnknownDormantFunds] = React.useState<number>(
    0,
  );
  const {
    frontierCount: { count: frontierCount },
  } = useFrontierCount();
  const { availableSupply } = useAvailableSupply();
  const isMediumAndLower = !useMediaQuery("(min-width: 768px)");

  React.useEffect(() => {
    if (!data) return;
    let totalFunds: number = 0;
    dormantFundsByRange = {};

    Object.entries(data).forEach(([year, months]: [string, any]) => {
      months.forEach((total: number, i: number) => {
        if (!total) return;
        const key = `Q${Math.ceil(i / 4 + 1)} ${year}`;

        totalFunds = new BigNumber(totalFunds).plus(total).toNumber();
        dormantFundsByRange[key] = {
          total: new BigNumber(dormantFundsByRange[key]?.total || 0)
            .plus(total)
            .toNumber(),
        };
      });
    });

    let totalDormant: number = 0;
    const dormantFundsByRangeKeys = Object.keys(dormantFundsByRange);
    const marks = dormantFundsByRangeKeys.reduce(
      (acc: any = {}, key: string, i: number) => {
        const percent = Math.ceil(
          (100 / (dormantFundsByRangeKeys.length - 1)) * i,
        );

        dormantFundsByRange[key].percent = percent;
        totalDormant =
          i === 0
            ? 0
            : new BigNumber(totalDormant)
                .plus(dormantFundsByRange[key].total)
                .toNumber();
        dormantFundsByRange[key].totalDormant = totalDormant;

        acc[percent] = key;

        return acc;
      },
      {},
    );

    setMarks(marks);
    setTotalFunds(totalFunds);
    setUnknownDormantFunds(
      new BigNumber(availableSupply).minus(totalFunds).toNumber(),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <>
      <Title level={3}>
        {t("pages.distribution.dormantFunds")}
      </Title>
      <Card size="small">
        <div style={{ marginBottom: "12px" }}>
          <Text style={{ fontSize: "12px" }}>
            {t("pages.distribution.dormantFundsExperiment", {
              totalAccounts: new BigNumber(frontierCount).toFormat(),
            })}
          </Text>
          <br />
          <Text style={{ fontSize: "12px" }}>
            <ul style={{ margin: "12px 0" }}>
              <li>
                {t("pages.distribution.availableSupply")}:{" "}
                <strong>
                  {new BigNumber(availableSupply).toFormat()} BAN\
                </strong>
              </li>
              <li>
                {t("pages.distribution.knownAccountBalances")}:{" "}
                <strong>{new BigNumber(totalFunds).toFormat()} BAN</strong>
              </li>
              <li>
                {t("pages.distribution.unknownDormantFunds")}:{" "}
                <strong>
                  {new BigNumber(unknownDormantFunds).toFormat()} BAN
                </strong>
              </li>
            </ul>
          </Text>
          <Text style={{ fontSize: "12px" }}>
            {t("pages.distribution.dormantFundsQuarterExample")}
          </Text>
        </div>

        <div
          style={{
            margin: `${
              isMediumAndLower ? "48px 20px 48px auto" : "72px auto 0"
            }`,
            width: isMediumAndLower ? "20%" : "90%",
            height: isMediumAndLower ? "300px" : "auto",
          }}
        >
          <Slider
            marks={marks}
            step={null}
            vertical={isMediumAndLower}
            reverse={isMediumAndLower}
            tooltipVisible
            defaultValue={0}
            tooltipPlacement={isMediumAndLower ? "left" : "top"}
            tipFormatter={key => {
              const totalDormant = new BigNumber(
                find(dormantFundsByRange, ["percent", key])?.totalDormant || 0,
              )
                .plus(unknownDormantFunds)
                .toNumber();
              const percentAvailableSupply = new BigNumber(totalDormant)
                .times(100)
                .dividedBy(availableSupply)
                .toFormat(2);

              return (
                <div style={{ fontSize: "12px" }}>
                  <div>
                    <strong>{new BigNumber(totalDormant).toFormat(5)}</strong>{" "}
                    {t("pages.distribution.dormantBanano")}
                  </div>
                  <div>
                    <strong>{percentAvailableSupply}%</strong>{" "}
                    {t("pages.distribution.ofAvailableSupply")}
                  </div>
                </div>
              );
            }}
          />
        </div>
      </Card>
    </>
  );
};

export default DormantFunds;
