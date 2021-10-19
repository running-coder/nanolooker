import * as React from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import flatten from "lodash/flatten";
import { Card, Col, Row, Skeleton, Typography } from "antd";

import LoadingStatistic from "components/LoadingStatistic";

import { Line } from "@antv/g2plot";
import useStatisticsSocial from "./hooks/use-statistics-2miners";

const { Text, Title } = Typography;

let minersChart: any = null;

const Statistics2MinersPage: React.FC = () => {
  const { t } = useTranslation();
  const { statistics, isLoading } = useStatisticsSocial();

  const totalPayouts = statistics.reduce((acc, { totalPayouts }) => {
    return (acc += totalPayouts);
  }, 0);

  const { date } = statistics[statistics.length - 1] || {};

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
              category: t("pages.statistics.2miners.payouts"),
              date,
            },
            {
              value: totalAccounts,
              category: t("pages.statistics.2miners.accounts"),
              date,
            },
            totalUniqueAccounts
              ? {
                  value: totalUniqueAccounts,
                  category: t("pages.statistics.2miners.uniqueAccounts"),
                  date,
                }
              : null,
            totalAccountsHolding
              ? {
                  value: totalAccountsHolding,
                  category: t("pages.statistics.2miners.accountsHolding"),
                  date,
                }
              : null,
            totalBalanceHolding
              ? {
                  value: totalBalanceHolding,
                  category: t("pages.statistics.2miners.balanceHolding"),
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
        visible: true,
        selected: {
          [t("pages.statistics.2miners.balanceHolding")]: false,
        },
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
            <br />
            <Text style={{ fontSize: "12px" }}>
              <strong>{t("pages.statistics.2miners.payouts")}</strong>:{" "}
              {t("pages.statistics.2miners.payoutsDescription")}
            </Text>
            <br />
            <Text style={{ fontSize: "12px" }}>
              <strong>{t("pages.statistics.2miners.accounts")}</strong>:{" "}
              {t("pages.statistics.2miners.accountsDescription")}
            </Text>
            <br />
            <Text style={{ fontSize: "12px" }}>
              <strong>{t("pages.statistics.2miners.uniqueAccounts")}</strong>:{" "}
              {t("pages.statistics.2miners.uniqueAccountsDescription", {
                date,
              })}
            </Text>
            <br />
            <Text style={{ fontSize: "12px" }}>
              <strong>{t("pages.statistics.2miners.accountsHolding")}</strong>:{" "}
              {t("pages.statistics.2miners.accountsHoldingDescription", {
                date,
              })}
            </Text>
            <br />
            <Text style={{ fontSize: "12px" }}>
              <strong>{t("pages.statistics.2miners.balanceHolding")}</strong>:{" "}
              {t("pages.statistics.2miners.balanceHoldingDescription", {
                date,
              })}
            </Text>
            <br />
            <br />
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
