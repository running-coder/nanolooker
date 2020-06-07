import React from "react";
import find from "lodash/find";
import { Card, Slider, Typography } from "antd";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import BigNumber from "bignumber.js";
import useAvailableSupply from "api/hooks/use-available-supply";

const { Text, Title } = Typography;

let dormantFundsByRange: any = {};

const DormantFunds = ({ data }: any) => {
  const [marks, setMarks] = React.useState({});
  const [totalFunds, setTotalFunds] = React.useState<number>(0);
  const [unknownDormantFunds, setUnknownDormantFunds] = React.useState<number>(
    0,
  );
  const { availableSupply } = useAvailableSupply();
  // const isSmallAndLower = useMediaQuery("(min-width: 992px)");
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
      <Title level={3}>Dormant funds</Title>
      <Card size="small">
        <div style={{ marginBottom: "12px" }}>
          <Text style={{ fontSize: "12px" }}>
            This is an experiment to understand how many accounts are active on
            the Nano blockchain since <strong>October 2018</strong>.
          </Text>
          <br />
          <Text style={{ fontSize: "12px" }}>
            If an account that last transacted before to October 2018 becomes
            active, it will be picked up by the compilation script and deducted
            from the <strong>unknown dormant funds</strong>.
          </Text>
          <br />
          <Text style={{ fontSize: "12px" }}>
            <ul style={{ margin: "12px 0" }}>
              <li>
                Nano available supply:{" "}
                <strong>
                  {new BigNumber(availableSupply).toFormat()} NANO
                </strong>
              </li>
              <li>
                Known account balances:{" "}
                <strong>{new BigNumber(totalFunds).toFormat()} NANO</strong>
              </li>
              <li>
                Unknown dormant funds:{" "}
                <strong>
                  {new BigNumber(unknownDormantFunds).toFormat()} NANO
                </strong>
              </li>
            </ul>
          </Text>
          <Text style={{ fontSize: "12px" }}>
            As an example, if an account last transacted 2 quarters ago (6
            months), its balance (including pending amounts) will be considered
            being "dormant" since 1 quarter ago
          </Text>
        </div>

        <div
          style={{
            margin: `${isMediumAndLower ? "48px 60% 48px" : "72px auto 0"}`,
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
                    dormant NANO
                  </div>
                  <div>
                    <strong>{percentAvailableSupply}%</strong> of available
                    supply
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
