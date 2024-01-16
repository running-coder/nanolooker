import * as React from "react";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import { Link } from "react-router-dom";

import { Card, Col, Row, Select, Tooltip } from "antd";
import BigNumber from "bignumber.js";

import { BlockCountContext } from "api/contexts/BlockCount";
import { ConfirmationHistoryContext } from "api/contexts/ConfirmationHistory";
import {
  BITCOIN_TOTAL_TRANSACTION_FEES_7D,
  BITCOIN_TOTAL_TRANSACTION_FEES_14D,
  BITCOIN_TOTAL_TRANSACTION_FEES_24H,
  BITCOIN_TOTAL_TRANSACTION_FEES_48H,
  MarketStatisticsContext,
  TOTAL_CONFIRMATIONS_7D,
  TOTAL_CONFIRMATIONS_14D,
  TOTAL_CONFIRMATIONS_24H,
  TOTAL_CONFIRMATIONS_48H,
  TOTAL_VOLUME_7D,
  TOTAL_VOLUME_14D,
  TOTAL_VOLUME_24H,
  TOTAL_VOLUME_48H,
} from "api/contexts/MarketStatistics";
import { NodeStatusContext } from "api/contexts/NodeStatus";
import { CurrencyDecimal, CurrencySymbol, PreferencesContext } from "api/contexts/Preferences";
import { RepresentativesContext } from "api/contexts/Representatives";
import useAvailableSupply from "api/hooks/use-available-supply";
import LoadingStatistic from "components/LoadingStatistic";
import QuestionCircle from "components/QuestionCircle";
import StatisticsChange from "components/StatisticsChange";
import { formatBytes } from "components/utils";

import Banner from "./Banner";
import RecentTransactions from "./RecentTransactions";

const { Option } = Select;

const HomePage = () => {
  const { t } = useTranslation();
  const isSmallAndLower = !useMediaQuery({ query: "(min-width: 576px)" });
  const { availableSupply } = useAvailableSupply();
  const { fiat } = React.useContext(PreferencesContext);

  const {
    marketStatistics,
    isInitialLoading: isMarketStatisticsInitialLoading,
    is24Hours,
    setIs24Hours,
    isError: isMarketStatisticsError,
  } = React.useContext(MarketStatisticsContext);
  const {
    marketCapRank,
    marketCapRank24h,
    marketCap,
    marketCapChangePercentage24h,
    volume24h,
    priceStats,
    NANOTPS_STATS = {},
    NANOSPEED_STATS: { median = null } = {},
  } = marketStatistics;

  const { send } = NANOTPS_STATS;

  const { count } = React.useContext(BlockCountContext);
  const { confirmation_stats: { average = 0 } = {} } = React.useContext(ConfirmationHistoryContext);

  let medianConfTime = median || average;
  const { representatives } = React.useContext(RepresentativesContext);
  const {
    nodeStatus: { ledgerSize },
    isLoading: isNodeStatusLoading,
  } = React.useContext(NodeStatusContext);
  const [formattedLedgerSize, setFormattedLedgerSize] = React.useState(formatBytes(0));

  const btcCurrentPrice = priceStats?.bitcoin?.[fiat] || 0;
  const btcTransactionFees24h =
    marketStatistics[BITCOIN_TOTAL_TRANSACTION_FEES_24H] && btcCurrentPrice
      ? new BigNumber(marketStatistics[BITCOIN_TOTAL_TRANSACTION_FEES_24H])
          .times(btcCurrentPrice)
          .toFixed(CurrencyDecimal?.[fiat])
      : 0;

  const btcTransactionFees7d =
    marketStatistics[BITCOIN_TOTAL_TRANSACTION_FEES_7D] && btcCurrentPrice
      ? new BigNumber(marketStatistics[BITCOIN_TOTAL_TRANSACTION_FEES_7D])
          .times(btcCurrentPrice)
          .toFixed(CurrencyDecimal?.[fiat])
      : 0;

  const btcTransactionFees14d =
    marketStatistics[BITCOIN_TOTAL_TRANSACTION_FEES_14D] && btcCurrentPrice
      ? new BigNumber(marketStatistics[BITCOIN_TOTAL_TRANSACTION_FEES_14D])
          .times(btcCurrentPrice)
          .toFixed(CurrencyDecimal?.[fiat])
      : 0;

  const btcTransactionFeesChange24h = btcTransactionFees24h
    ? new BigNumber(marketStatistics[BITCOIN_TOTAL_TRANSACTION_FEES_24H])
        .minus(marketStatistics[BITCOIN_TOTAL_TRANSACTION_FEES_48H])
        .dividedBy(marketStatistics[BITCOIN_TOTAL_TRANSACTION_FEES_48H])
        .times(100)
        .toNumber()
    : 0;

  const btcTransactionFeesChange14d = btcTransactionFees14d
    ? new BigNumber(marketStatistics[BITCOIN_TOTAL_TRANSACTION_FEES_7D])
        .minus(marketStatistics[BITCOIN_TOTAL_TRANSACTION_FEES_14D])
        .dividedBy(marketStatistics[BITCOIN_TOTAL_TRANSACTION_FEES_14D])
        .times(100)
        .toNumber()
    : 0;
  let onChainVolume48hAgo = 0;
  let onChainVolumeChange24h = 0;
  if (marketStatistics[TOTAL_VOLUME_24H] && marketStatistics[TOTAL_VOLUME_48H]) {
    onChainVolume48hAgo = new BigNumber(marketStatistics[TOTAL_VOLUME_48H])
      .minus(marketStatistics[TOTAL_VOLUME_24H])
      .toNumber();
    onChainVolumeChange24h = new BigNumber(marketStatistics[TOTAL_VOLUME_24H])
      .minus(onChainVolume48hAgo)
      .dividedBy(onChainVolume48hAgo)
      .times(100)
      .toNumber();
  }

  let onChainVolume14dAgo = 0;
  let onChainVolumeChange7d = 0;
  if (marketStatistics[TOTAL_VOLUME_7D] && marketStatistics[TOTAL_VOLUME_14D]) {
    onChainVolume14dAgo = new BigNumber(marketStatistics[TOTAL_VOLUME_14D])
      .minus(marketStatistics[TOTAL_VOLUME_7D])
      .toNumber();
    onChainVolumeChange7d = new BigNumber(marketStatistics[TOTAL_VOLUME_7D])
      .minus(onChainVolume14dAgo)
      .dividedBy(onChainVolume14dAgo)
      .times(100)
      .toNumber();
  }

  let totalConfirmations48hAgo = 0;
  let confirmationChange24h = 0;
  if (marketStatistics[TOTAL_CONFIRMATIONS_24H] && marketStatistics[TOTAL_CONFIRMATIONS_48H]) {
    totalConfirmations48hAgo = new BigNumber(marketStatistics[TOTAL_CONFIRMATIONS_48H])
      .minus(marketStatistics[TOTAL_CONFIRMATIONS_24H])
      .toNumber();
    confirmationChange24h = new BigNumber(marketStatistics[TOTAL_CONFIRMATIONS_24H])
      .minus(totalConfirmations48hAgo)
      .dividedBy(totalConfirmations48hAgo)
      .times(100)
      .toNumber();
  }

  let totalConfirmations14dAgo = 0;
  let confirmationChange7d = 0;
  if (marketStatistics[TOTAL_CONFIRMATIONS_7D] && marketStatistics[TOTAL_CONFIRMATIONS_14D]) {
    totalConfirmations14dAgo = new BigNumber(marketStatistics[TOTAL_CONFIRMATIONS_14D])
      .minus(marketStatistics[TOTAL_CONFIRMATIONS_7D])
      .toNumber();
    confirmationChange7d = new BigNumber(marketStatistics[TOTAL_CONFIRMATIONS_7D])
      .minus(totalConfirmations14dAgo)
      .dividedBy(totalConfirmations14dAgo)
      .times(100)
      .toNumber();
  }

  React.useEffect(() => {
    setFormattedLedgerSize(formatBytes(ledgerSize));
  }, [ledgerSize]);

  return (
    <>
      <Banner />
      <Row gutter={[12, 0]}>
        <Col xs={{ span: 24, order: 3 }} md={{ span: 12, order: 1 }} style={{ width: "100%" }}>
          <Card
            size="small"
            title={t("pages.home.network")}
            extra={<Link to="/statistics/social">{t("pages.home.viewSocialEngagement")}</Link>}
          >
            <Row gutter={6}>
              <Col xs={24} sm={12}>
                <LoadingStatistic
                  isLoading={!count}
                  title={t("pages.home.latestBlock")}
                  value={count}
                />
                <LoadingStatistic
                  isLoading={
                    isMarketStatisticsInitialLoading || isMarketStatisticsError || !availableSupply
                  }
                  title={t("pages.home.circulatingSupply")}
                  tooltip={t<string>("tooltips.circulatingSupply")}
                  value={new BigNumber(availableSupply).toNumber()}
                />
                <LoadingStatistic
                  isLoading={isNodeStatusLoading}
                  tooltip={t<string>("tooltips.ledgerSize")}
                  title={t("pages.home.ledgerSize")}
                  suffix={formattedLedgerSize.suffix}
                  value={new BigNumber(formattedLedgerSize.value).toFormat(2)}
                />
              </Col>
              <Col xs={24} sm={12}>
                <LoadingStatistic
                  isLoading={!representatives.length}
                  title={t("pages.home.principalRepOnline")}
                  value={
                    representatives.filter(({ isOnline, isPrincipal }) => isOnline && isPrincipal)
                      ?.length
                  }
                />
                <LoadingStatistic
                  isLoading={!medianConfTime}
                  title={t("pages.home.avgConfirmationTime")}
                  tooltip={t<string>("tooltips.avgConfirmationTime")}
                  value={new BigNumber(medianConfTime).dividedBy(1000).toNumber()}
                />

                {/* {!isSmallAndLower ? (
                  <LoadingStatistic
                    isLoading={false}
                    title={t("pages.home.transactionFees")}
                    tooltip={t<string>("tooltips.transactionFees")}
                    value={0}
                  />
                ) : null} */}

                <LoadingStatistic
                  isLoading={!send?.tps}
                  title={t("pages.home.averageTps")}
                  tooltip={
                    send
                      ? (t("tooltips.averageTps", {
                          date: send.date,
                          block_count: send.block_count,
                          block_type: send.block_type,
                          bps: new BigNumber(send.bps).toFixed(2),
                          cps_p90: new BigNumber(send.cps_p90).toFixed(2),
                        }) as string)
                      : ""
                  }
                  value={send?.cps_p90 ? new BigNumber(send.cps_p90).dividedBy(2).toFixed(2) : 0}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col
          xs={{ span: 24, order: 2 }}
          md={{ span: 12, order: 2 }}
          lg={6}
          style={{ width: "100%" }}
        >
          <Card
            size="small"
            title={
              <>
                <Select
                  value={is24Hours}
                  onChange={(value: boolean) => {
                    setIs24Hours(value);
                  }}
                >
                  <Option value={true}>{t("pages.home.last24Hours")}</Option>
                  <Option value={false}>{t("pages.home.last7Days")}</Option>
                </Select>
                <span>
                  <Tooltip
                    placement="right"
                    title={is24Hours ? t("tooltips.last24Hours") : t("tooltips.last7days")}
                  >
                    <QuestionCircle />
                  </Tooltip>
                </span>
              </>
            }
          >
            <Row gutter={6}>
              <Col xs={24}>
                <LoadingStatistic
                  isLoading={
                    isMarketStatisticsInitialLoading ||
                    isMarketStatisticsError ||
                    !onChainVolumeChange24h
                  }
                  tooltip={t("tooltips.onChainVolume") as string}
                  title={t("pages.home.onChainVolume")}
                  suffix={
                    <StatisticsChange
                      value={is24Hours ? onChainVolumeChange24h : onChainVolumeChange7d}
                      isPercent
                    />
                  }
                  value={new BigNumber(
                    is24Hours
                      ? marketStatistics[TOTAL_VOLUME_24H]
                      : marketStatistics[TOTAL_VOLUME_7D],
                  )
                    .decimalPlaces(5)
                    .toNumber()}
                />
                <LoadingStatistic
                  isLoading={
                    isMarketStatisticsInitialLoading ||
                    isMarketStatisticsError ||
                    !confirmationChange24h
                  }
                  title={t("pages.home.confirmedTransactions")}
                  suffix={
                    <StatisticsChange
                      value={is24Hours ? confirmationChange24h : confirmationChange7d}
                      isPercent
                    />
                  }
                  value={
                    is24Hours
                      ? marketStatistics[TOTAL_CONFIRMATIONS_24H]
                      : marketStatistics[TOTAL_CONFIRMATIONS_7D]
                  }
                />
                {isSmallAndLower ? (
                  <LoadingStatistic
                    isLoading={false}
                    title={t("pages.home.transactionFees")}
                    tooltip={t<string>("tooltips.transactionFees")}
                    value={0}
                  />
                ) : null}
                <LoadingStatistic
                  isLoading={isMarketStatisticsInitialLoading || isMarketStatisticsError}
                  title={`${t("pages.home.bitcoinTransactionFees")} (${fiat.toUpperCase()})`}
                  tooltip={t<string>("tooltips.bitcoinTransactionFees")}
                  prefix={CurrencySymbol?.[fiat]}
                  value={is24Hours ? btcTransactionFees24h : btcTransactionFees7d}
                  suffix={
                    <StatisticsChange
                      value={is24Hours ? btcTransactionFeesChange24h : btcTransactionFeesChange14d}
                      isPercent
                    />
                  }
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col
          xs={{ span: 24, order: 1 }}
          md={{ span: 12, order: 3 }}
          lg={6}
          style={{ width: "100%" }}
        >
          <Card size="small" title={t("pages.home.market")}>
            <Row gutter={6}>
              <Col xs={24}>
                <LoadingStatistic
                  isLoading={
                    !marketCapRank || isMarketStatisticsInitialLoading || isMarketStatisticsError
                  }
                  title={t("pages.home.marketCapRank")}
                  prefix="#"
                  suffix={
                    marketCapRank24h ? (
                      <StatisticsChange value={marketCapRank24h - marketCapRank} isNumber />
                    ) : null
                  }
                  value={`${marketCapRank}`}
                />

                <LoadingStatistic
                  isLoading={
                    !marketCap || isMarketStatisticsInitialLoading || isMarketStatisticsError
                  }
                  title={`${t("pages.home.marketCap")} (${fiat.toUpperCase()})`}
                  prefix={CurrencySymbol?.[fiat]}
                  suffix={<StatisticsChange value={marketCapChangePercentage24h} isPercent />}
                  value={`${new BigNumber(marketCap).toNumber()}`}
                />
                <LoadingStatistic
                  isLoading={
                    !volume24h || isMarketStatisticsInitialLoading || isMarketStatisticsError
                  }
                  title={`${t("pages.home.exchangeVolume")} (${fiat.toUpperCase()})`}
                  prefix={CurrencySymbol?.[fiat]}
                  value={`${new BigNumber(volume24h).toNumber()}`}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      <RecentTransactions />
    </>
  );
};

export default HomePage;
