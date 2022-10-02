import * as React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, Col, Row } from "antd";
import BigNumber from "bignumber.js";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import useAvailableSupply from "api/hooks/use-available-supply";
import {
  PreferencesContext,
  CurrencySymbol,
  CurrencyDecimal,
} from "api/contexts/Preferences";
import { BlockCountContext } from "api/contexts/BlockCount";
import { ConfirmationHistoryContext } from "api/contexts/ConfirmationHistory";
import { RepresentativesContext } from "api/contexts/Representatives";
import { NodeStatusContext } from "api/contexts/NodeStatus";
import {
  MarketStatisticsContext,
  TOTAL_CONFIRMATIONS_24H,
  TOTAL_CONFIRMATIONS_48H,
  TOTAL_VOLUME_24H,
  TOTAL_VOLUME_48H,
  BITCOIN_TOTAL_TRANSACTION_FEES_24H,
  BITCOIN_TOTAL_TRANSACTION_FEES_48H,
} from "api/contexts/MarketStatistics";
import LoadingStatistic from "components/LoadingStatistic";
import StatisticsChange from "components/StatisticsChange";
import { formatBytes } from "components/utils";
import Banner from "./Banner";
import RecentTransactions from "./RecentTransactions";

const HomePage = () => {
  const { t } = useTranslation();
  const isSmallAndLower = !useMediaQuery("(min-width: 576px)");
  const { availableSupply } = useAvailableSupply();
  const { fiat } = React.useContext(PreferencesContext);
  const {
    marketStatistics,
    isInitialLoading: isMarketStatisticsInitialLoading,
    isError: isMarketStatisticsError,
  } = React.useContext(MarketStatisticsContext);
  const {
    marketCapRank,
    marketCapRank24h,
    marketCap,
    marketCapChangePercentage24h,
    volume24h,
    priceStats,
  } = marketStatistics;

  const { count } = React.useContext(BlockCountContext);
  const { confirmation_stats: { average = 0 } = {} } = React.useContext(
    ConfirmationHistoryContext,
  );
  const { representatives } = React.useContext(RepresentativesContext);
  const {
    nodeStatus: { ledgerSize },
    isLoading: isNodeStatusLoading,
  } = React.useContext(NodeStatusContext);
  const [formattedLedgerSize, setFormattedLedgerSize] = React.useState(
    formatBytes(0),
  );

  const btcCurrentPrice = priceStats?.bitcoin?.[fiat] || 0;
  const btcTransactionFees24h =
    marketStatistics[BITCOIN_TOTAL_TRANSACTION_FEES_24H] && btcCurrentPrice
      ? new BigNumber(marketStatistics[BITCOIN_TOTAL_TRANSACTION_FEES_24H])
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

  let onChainVolume48hAgo = 0;
  let onChainVolumeChange24h = 0;
  if (
    marketStatistics[TOTAL_VOLUME_24H] &&
    marketStatistics[TOTAL_VOLUME_48H]
  ) {
    onChainVolume48hAgo = new BigNumber(marketStatistics[TOTAL_VOLUME_48H])
      .minus(marketStatistics[TOTAL_VOLUME_24H])
      .toNumber();
    onChainVolumeChange24h = new BigNumber(marketStatistics[TOTAL_VOLUME_24H])
      .minus(onChainVolume48hAgo)
      .dividedBy(onChainVolume48hAgo)
      .times(100)
      .toNumber();
  }

  let totalConfirmations48hAgo = 0;
  let confirmationChange24h = 0;
  if (
    marketStatistics[TOTAL_CONFIRMATIONS_24H] &&
    marketStatistics[TOTAL_CONFIRMATIONS_48H]
  ) {
    totalConfirmations48hAgo = new BigNumber(
      marketStatistics[TOTAL_CONFIRMATIONS_48H],
    )
      .minus(marketStatistics[TOTAL_CONFIRMATIONS_24H])
      .toNumber();
    confirmationChange24h = new BigNumber(
      marketStatistics[TOTAL_CONFIRMATIONS_24H],
    )
      .minus(totalConfirmations48hAgo)
      .dividedBy(totalConfirmations48hAgo)
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
        <Col
          xs={{ span: 24, order: 3 }}
          md={{ span: 12, order: 1 }}
          style={{ width: "100%" }}
        >
          <Card
            size="small"
            title={t("pages.home.network")}
            extra={
              <Link to="/statistics/social">
                {t("pages.home.viewSocialEngagement")}
              </Link>
            }
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
                    isMarketStatisticsInitialLoading ||
                    isMarketStatisticsError ||
                    !availableSupply
                  }
                  title={t("pages.home.circulatingSupply")}
                  tooltip={t("tooltips.circulatingSupply")}
                  value={new BigNumber(availableSupply).toNumber()}
                />
                <LoadingStatistic
                  isLoading={isNodeStatusLoading}
                  tooltip={t("tooltips.ledgerSize")}
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
                    representatives.filter(
                      ({ isOnline, isPrincipal }) => isOnline && isPrincipal,
                    )?.length
                  }
                />
                <LoadingStatistic
                  isLoading={!average}
                  title={t("pages.home.avgConfirmationTime")}
                  tooltip={t("tooltips.avgConfirmationTime")}
                  value={new BigNumber(average).dividedBy(1000).toNumber()}
                />

                {!isSmallAndLower ? (
                  <LoadingStatistic
                    isLoading={false}
                    title={t("pages.home.transactionFees")}
                    tooltip={t("tooltips.transactionFees")}
                    value={0}
                  />
                ) : null}
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
          <Card size="small" title={t("pages.home.last24Hours")}>
            <Row gutter={6}>
              <Col xs={24}>
                <LoadingStatistic
                  isLoading={
                    isMarketStatisticsInitialLoading ||
                    isMarketStatisticsError ||
                    !onChainVolumeChange24h
                  }
                  tooltip={t("tooltips.onChainVolume")}
                  title={t("pages.home.onChainVolume")}
                  suffix={
                    <StatisticsChange
                      value={onChainVolumeChange24h}
                      isPercent
                    />
                  }
                  value={new BigNumber(marketStatistics[TOTAL_VOLUME_24H])
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
                    <StatisticsChange value={confirmationChange24h} isPercent />
                  }
                  value={marketStatistics[TOTAL_CONFIRMATIONS_24H]}
                />
                {isSmallAndLower ? (
                  <LoadingStatistic
                    isLoading={false}
                    title={t("pages.home.transactionFees")}
                    tooltip={t("tooltips.transactionFees")}
                    value={0}
                  />
                ) : null}
                <LoadingStatistic
                  isLoading={
                    isMarketStatisticsInitialLoading || isMarketStatisticsError
                  }
                  title={`${t(
                    "pages.home.bitcoinTransactionFees",
                  )} (${fiat.toUpperCase()})`}
                  tooltip={t("tooltips.bitcoinTransactionFees")}
                  prefix={CurrencySymbol?.[fiat]}
                  value={btcTransactionFees24h}
                  suffix={
                    <StatisticsChange
                      value={btcTransactionFeesChange24h}
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
                    isMarketStatisticsInitialLoading || isMarketStatisticsError
                  }
                  title={t("pages.home.marketCapRank")}
                  prefix="#"
                  suffix={
                    marketCapRank24h ? (
                      <StatisticsChange
                        value={marketCapRank24h - marketCapRank}
                        isNumber
                      />
                    ) : null
                  }
                  value={`${marketCapRank}`}
                />

                <LoadingStatistic
                  isLoading={
                    isMarketStatisticsInitialLoading || isMarketStatisticsError
                  }
                  title={`${t("pages.home.marketCap")} (${fiat.toUpperCase()})`}
                  prefix={CurrencySymbol?.[fiat]}
                  suffix={
                    <StatisticsChange
                      value={marketCapChangePercentage24h}
                      isPercent
                    />
                  }
                  value={`${new BigNumber(marketCap).toNumber()}`}
                />
                <LoadingStatistic
                  isLoading={
                    isMarketStatisticsInitialLoading || isMarketStatisticsError
                  }
                  title={`${t(
                    "pages.home.exchangeVolume",
                  )} (${fiat.toUpperCase()})`}
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
