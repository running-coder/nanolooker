import * as React from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";

import { Line } from "@antv/g2plot";
import { Card, Col, Row, Skeleton, Typography } from "antd";
import BigNumber from "bignumber.js";
import flatten from "lodash/flatten";

import LoadingStatistic from "components/LoadingStatistic";
import { ACCOUNT_2MINERS } from "pages/Account/Details/ExtraRow";
import AccountHeader from "pages/Account/Header/Account";
import TransactionsTable from "pages/Account/Transactions";

import useStatisticsSocial from "./hooks/use-statistics-2miners";

const { Text, Title } = Typography;

let minersChart: any = null;
const TRANSACTIONS_PER_PAGE = 25;

const Statistics2MinersPage: React.FC = () => {
  const { t } = useTranslation();
  const { statistics, isLoading } = useStatisticsSocial();
  const [totalFiatPayouts, setTotalFiatPayouts] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  const totalPayouts = statistics.reduce((acc, { totalPayouts }) => {
    return (acc += totalPayouts);
  }, 0);

  const { date = "" } = statistics[statistics.length - 1] || {};

  React.useEffect(() => {
    if (isLoading || !statistics.length) return;

    setTotalFiatPayouts(
      statistics.reduce(
        (acc, { totalFiatPayouts = 0 }) => new BigNumber(acc).plus(totalFiatPayouts).toNumber(),
        0,
      ),
    );

    const data = flatten(
      statistics.map(
        ({
          totalPayouts,
          totalAccounts,
          totalUniqueAccounts,
          totalAccountsHolding,
          totalBalanceHolding,
          totalFiatPayouts,
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
            totalFiatPayouts
              ? {
                  value: totalFiatPayouts,
                  category: t("pages.statistics.2miners.fiatPayouts"),
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
      yAxis: {
        type: "linear",
        min: 290,
        base: 2,
      },
      tooltip: {
        // @ts-ignore
        customItems: (originalItems: any) => {
          // @ts-ignore
          const items = originalItems.map(data => {
            const { name, value, ...rest } = data;

            let prefix = "";
            let format: undefined | number;
            if (
              name === t("pages.statistics.2miners.payouts") ||
              name === t("pages.statistics.2miners.balanceHolding")
            ) {
              prefix = "Ӿ";
            } else if (name === t("pages.statistics.2miners.fiatPayouts")) {
              prefix = "$";
              format = 2;
            }

            return {
              ...rest,
              name,
              value: `${prefix}${new BigNumber(value).toFormat(format)}`,
            };
          });

          return items;
        },
      },
      legend: {
        visible: true,
        // selected: {
        //   [t("pages.statistics.2miners.balanceHolding")]: false,
        //   [t("pages.statistics.2miners.fiatPayouts")]: false,
        // },
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

  const transactions = flatten(statistics.map(({ blocks = [] }) => blocks));
  const showPaginate = transactions.length > TRANSACTIONS_PER_PAGE;
  const totalPages = Math.ceil(transactions.length / TRANSACTIONS_PER_PAGE);

  return (
    <>
      <Helmet>
        <title>{t("pages.statistics.2miners.title")}</title>
      </Helmet>
      <div style={{ display: "flex", alignItems: "baseline" }}>
        <Title level={3}>{t("pages.statistics.2miners.title")}</Title>
        <a
          style={{ display: "inline-block", marginLeft: 12 }}
          href="https://2miners.com/blog/how-to-get-payouts-for-ethereum-mining-without-fees/"
          rel="noopener noreferrer"
          target="_blank"
        >
          {t("pages.statistics.2miners.announcement")}
        </a>
      </div>

      <Card size="small" className="detail-layout">
        <Row>
          <Col xs={24}>
            <AccountHeader account={ACCOUNT_2MINERS} isLink={true} hideOptions={true} />
          </Col>
        </Row>
        <Row>
          <Col xs={24} sm={12} lg={8}>
            <LoadingStatistic
              title={<>{t("pages.statistics.2miners.totalPayouts")}</>}
              value={totalPayouts}
              isLoading={!totalPayouts}
              prefix="Ӿ"
            />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <LoadingStatistic
              title={<>{t("pages.statistics.2miners.totalFiatPayouts")}</>}
              value={totalFiatPayouts}
              isLoading={!totalFiatPayouts}
              prefix="$"
            />
          </Col>
        </Row>
        <Row>
          <Col xs={24}>
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
            <Text style={{ fontSize: "12px" }}>
              <strong>{t("pages.statistics.2miners.fiatPayouts")}</strong>:{" "}
              {t("pages.statistics.2miners.fiatPayoutsDescription", {
                date,
              })}
            </Text>
          </Col>
        </Row>

        <Row>
          <Col xs={24}>
            <Skeleton loading={isLoading || !statistics.length} active>
              <div id="2miners-chart" />
            </Skeleton>
          </Col>
        </Row>
      </Card>

      <TransactionsTable
        scrollTo="totalTransactions"
        data={transactions}
        isLoading={isLoading}
        isPaginated={true}
        showPaginate={showPaginate}
        pageSize={TRANSACTIONS_PER_PAGE}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </>
  );
};

export default Statistics2MinersPage;
