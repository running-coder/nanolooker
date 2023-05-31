import * as React from "react";
import { Helmet } from "react-helmet";
import { Trans, useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import { Link } from "react-router-dom";

import { Button, Card, Col, Row, Skeleton, Tooltip, Typography } from "antd";
import BigNumber from "bignumber.js";
import orderBy from "lodash/orderBy";
import TimeAgo from "timeago-react";

import { MarketStatisticsContext } from "api/contexts/MarketStatistics";
import { CurrencyDecimal, CurrencySymbol, PreferencesContext } from "api/contexts/Preferences";
import useAccountsBalances from "api/hooks/use-accounts-balances";
// import useAvailableSupply from "api/hooks/use-available-supply";
import useDeveloperAccountFund from "api/hooks/use-developer-fund-transactions";
import LoadingStatistic from "components/LoadingStatistic";
import QuestionCircle from "components/QuestionCircle";
import { rawToRai, timestampToDate } from "components/utils";

import KnownAccounts from "../../knownAccounts.json";

const { DEVELOPER_FUND_ACCOUNTS } = KnownAccounts;

const { Title } = Typography;

const DeveloperFund: React.FC = () => {
  const { t } = useTranslation();
  let totalBalance: number = 0;
  const { fiat } = React.useContext(PreferencesContext);
  const {
    marketStatistics: { currentPrice, priceStats },
    isInitialLoading: isMarketStatisticsInitialLoading,
  } = React.useContext(MarketStatisticsContext);
  const { accountsBalances, isLoading: isAccountsBalancesLoading } =
    useAccountsBalances(DEVELOPER_FUND_ACCOUNTS);
  // const { availableSupply } = useAvailableSupply();
  const { developerFundTransactions } = useDeveloperAccountFund();
  const isSmallAndLower = !useMediaQuery({ query: "(min-width: 576px)" });

  const data = orderBy(
    Object.entries(accountsBalances?.balances || []).reduce(
      // @ts-ignore
      (accounts, [account, { balance, pending }]) => {
        const calculatedBalance = new BigNumber(rawToRai(balance || 0))
          .plus(rawToRai(pending || 0))
          .toNumber();

        totalBalance = new BigNumber(totalBalance).plus(calculatedBalance).toNumber();

        accounts.push({
          account,
          balance: calculatedBalance,
        });

        return accounts;
      },
      [] as any,
    ),
    ["balance"],
    ["desc"],
  );

  const btcCurrentPrice = priceStats?.bitcoin?.[fiat] || 0;
  const fiatBalance = new BigNumber(totalBalance)
    .times(currentPrice)
    .toFormat(CurrencyDecimal?.[fiat]);
  const btcBalance = btcCurrentPrice
    ? new BigNumber(totalBalance).times(currentPrice).dividedBy(btcCurrentPrice).toFormat(12)
    : null;

  const skeletonProps = {
    active: true,
    paragraph: false,
    loading: isAccountsBalancesLoading || isMarketStatisticsInitialLoading,
  };

  const {
    amount,
    local_timestamp = 0,
    hash: lastTransactionHash,
  } = developerFundTransactions?.[0] || {};
  const modifiedTimestamp = Number(local_timestamp) * 1000;
  const lastTransactionAmount = new BigNumber(rawToRai(amount || 0)).toNumber();

  return (
    <>
      <Helmet>
        <title>Banano {t("menu.developerFund")}</title>
      </Helmet>
      <Row gutter={[12, 0]}>
        <Col xs={24} lg={12}>
          <Title level={3}>{t("menu.developerFund")}</Title>
          <Card size="small" className="detail-layout">
            <div
              className="divider"
              style={{
                paddingBottom: "6px",
                marginBottom: "12px",
              }}
            >
              <Trans
                i18nKey="pages.developerFund.description"
                // @ts-ignore
                count={data.length}
              >
                <a
                  href="https://stats.foldingathome.org/team/234980"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Folding@Home
                </a>
              </Trans>
            </div>

            <Row gutter={6}>
              <Col xs={24} sm={6}>
                {t("common.totalBalance")}
              </Col>
              <Col xs={24} sm={18}>
                <LoadingStatistic isLoading={skeletonProps.loading} value={totalBalance} />
                <Skeleton {...skeletonProps}>
                  {`${CurrencySymbol?.[fiat]} ${fiatBalance}${
                    btcBalance ? ` / ${btcBalance} BTC` : ""
                  } `}
                </Skeleton>
              </Col>
            </Row>
            <Row gutter={6}>
              <Col xs={24} sm={6}>
                {t("pages.developerFund.lastTransaction")}
                <Tooltip
                  placement="right"
                  title={t("tooltips.lastTransaction", {
                    totalAccounts: data.length,
                  })}
                >
                  <QuestionCircle />
                </Tooltip>
              </Col>
              <Col xs={24} sm={18}>
                <Skeleton active loading={!modifiedTimestamp} paragraph={false}>
                  <TimeAgo datetime={modifiedTimestamp} live={false} /> (
                  {timestampToDate(modifiedTimestamp)})
                  <br />
                </Skeleton>
                <Skeleton active loading={!lastTransactionAmount} paragraph={false}>
                  {lastTransactionAmount}
                  <br />
                </Skeleton>
                <Skeleton active loading={!lastTransactionHash} paragraph={false}>
                  <Link to={`/block/${lastTransactionHash}`} className="break-word">
                    {lastTransactionHash}
                  </Link>
                  <br />
                </Skeleton>
                <Link to={`/developer-fund/transactions`}>
                  <Button type="primary" size="small" style={{ marginTop: "6px" }}>
                    {t("pages.developerFund.allTransactions")}
                  </Button>
                </Link>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Title level={3}>
        {t("pages.developerFund.totalAccounts", { totalAccounts: data.length })}
      </Title>

      <Card size="small" className="detail-layout" style={{ marginBottom: "12px" }}>
        {!isSmallAndLower ? (
          <>
            <Row gutter={6}>
              <Col sm={10} md={10} xl={6}>
                {t("common.balance")}
              </Col>
              <Col sm={14} md={14} xl={18}>
                {t("common.account")}
              </Col>
            </Row>
          </>
        ) : null}
        {data?.map(({ account, balance }) => (
          <Row gutter={6} key={account}>
            <Col sm={10} md={10} xl={6}>
              <span
                className="default-color"
                style={{
                  display: "block",
                }}
              >
                {balance}
              </span>
            </Col>
            <Col sm={14} md={14} xl={18}>
              <Link to={`/account/${account}`} className="break-word">
                {account}
              </Link>
            </Col>
          </Row>
        ))}
      </Card>
    </>
  );
};

export default DeveloperFund;
