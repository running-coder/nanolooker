import * as React from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import flatten from "lodash/flatten";
import { Card, Col, Row, Skeleton, Typography } from "antd";

import LoadingStatistic from "components/LoadingStatistic";

import { Line } from "@antv/g2plot";
import useStatisticsSocial from "./hooks/use-statistics-2miners";

const { Title } = Typography;

let minersChart: any = null;

const Statistics2MinersPage: React.FC = () => {
  const { t } = useTranslation();
  const { statistics, isLoading } = useStatisticsSocial();

  const totalPayouts = statistics.reduce((acc, { totalPayouts }) => {
    return (acc += totalPayouts);
  }, 0);

  React.useEffect(() => {
    if (isLoading || !statistics.length) return;

    const data = flatten(
      statistics.map(
        ({
          totalPayouts,
          totalAccounts,
          totalUniqueAccounts,
          totalAccountsHolding,
          totalBalanceHolding,
          date,
        }) =>
          [
            {
              value: totalPayouts,
              category: "Total Payouts",
              date,
            },
            {
              value: totalAccounts,
              category: "Total Accounts",
              date,
            },
            totalUniqueAccounts
              ? {
                  value: totalUniqueAccounts,
                  category: "Total Unique Accounts",
                  date,
                }
              : null,
            totalAccountsHolding
              ? {
                  value: totalAccountsHolding,
                  category: "Total Accounts Holding",
                  date,
                }
              : null,
            totalBalanceHolding
              ? {
                  value: totalBalanceHolding,
                  category: "Total Balance Holding",
                  date,
                }
              : null,
          ].filter(Boolean),
      ),
    );

    const config = {
      data,
      xField: "date",
      yField: "value",
      seriesField: "category",
      xAxis: {
        type: "time",
      },
      legend: {
        visible: false,
      },
    };

    if (!minersChart) {
      minersChart = new Line(
        document.getElementById("2miners-chart") as HTMLElement,
        // @ts-ignore
        config,
      );
      minersChart.render();
    } else {
      minersChart.update(config);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, statistics]);

  React.useEffect(() => {
    return () => {
      minersChart?.destroy();
      minersChart = null;
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>{t("pages.statistics.2miners.title")}</title>
      </Helmet>
      <Title level={3}>{t("pages.statistics.2miners.title")}</Title>
      <Card size="small" bordered={false} className="detail-layout">
        <Row>
          <Col xs={24}>
            <LoadingStatistic
              title={t("pages.statistics.2miners.totalPayouts")}
              value={totalPayouts}
              isLoading={!totalPayouts}
              suffix="NANO"
            />

            {/* <ul>
              <li>
                <Text style={{ fontSize: "12px" }}>
                  {t("pages.statistics.2miners.totalAccountsHolding")}: The
                  number of accounts that holds more than 0.001 Nano since they
                  had their payout.
                </Text>
              </li>
            </ul> */}

            <Skeleton loading={isLoading || !statistics.length} active>
              <div id="2miners-chart" />
            </Skeleton>
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default Statistics2MinersPage;
