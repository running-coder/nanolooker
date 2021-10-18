import * as React from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import BigNumber from "bignumber.js";
import { Card, Col, Row, Skeleton, Typography } from "antd";

import { Line } from "@antv/g2plot";
import useStatisticsSocial from "./hooks/use-statistics-2miners";

const { Title } = Typography;

let minersChart: any = null;

const Statistics2MinersPage: React.FC = () => {
  const { t } = useTranslation();
  const { statistics, isLoading } = useStatisticsSocial();

  React.useEffect(() => {
    if (isLoading || !statistics.length) return;

    const config = {
      data: statistics,
      xField: "date",
      yField: "totalAccounts",
      xAxis: {
        type: "time",
      },
      legend: {
        visible: false,
      },
      tooltip: {
        customItems: (originalItems: any) => {
          const items = [
            {
              color: originalItems[0].color,
              name: t("pages.statistics.2miners.totalAccounts"),
              value: originalItems[0].value,
            },
            {
              name: t("pages.statistics.2miners.totalPayouts"),
              value: `${new BigNumber(
                originalItems[0].data.totalPayouts,
              )} NANO`,
            },
          ];

          if (originalItems[0].data.totalAccountsHolding) {
            items.push({
              name: t("pages.statistics.2miners.totalAccountsHolding"),
              value: originalItems[0].data.totalAccountsHolding,
            });
          }

          return items;
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
