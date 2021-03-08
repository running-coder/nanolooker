import React from "react";
import { useTranslation } from "react-i18next";
import { Card, Col, Row, Skeleton, Statistic } from "antd";
import BigNumber from "bignumber.js";
import {
  PreferencesContext,
  CurrencySymbol,
  CurrencyDecimal,
} from "api/contexts/Preferences";
import { BlockCountContext } from "api/contexts/BlockCount";
import { ConfirmationHistoryContext } from "api/contexts/ConfirmationHistory";
import { RepresentativesOnlineContext } from "api/contexts/RepresentativesOnline";
import { NodeStatusContext } from "api/contexts/NodeStatus";
import {
  MarketStatisticsContext,
  TOTAL_CONFIRMATIONS_KEY_24H,
  TOTAL_CONFIRMATIONS_KEY_48H,
  TOTAL_NANO_VOLUME_KEY_24H,
  TOTAL_NANO_VOLUME_KEY_48H,
  TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H,
  TOTAL_BITCOIN_TRANSACTION_FEES_KEY_48H,
} from "api/contexts/MarketStatistics";
import LoadingStatistic from "components/LoadingStatistic";
import StatisticsChange from "components/StatisticsChange";
import RecentTransactions from "./RecentTransactions";

const HomePage = () => {
  const { t } = useTranslation();
  const { fiat } = React.useContext(PreferencesContext);
  const {
    marketStatistics,
    isInitialLoading: isMarketStatisticsInitialLoading,
  } = React.useContext(MarketStatisticsContext);
  const {
    marketCapRank,
    marketCapRank24h,
    marketCap,
    marketCapChangePercentage24h,
    volume24h,
    circulatingSupply,
    priceStats: { bitcoin: { [fiat]: btcCurrentPrice = 0 } } = {
      bitcoin: { [fiat]: 0 },
    },
  } = marketStatistics;

  const { count } = React.useContext(BlockCountContext);
  const { confirmation_stats: { average = 0 } = {} } = React.useContext(
    ConfirmationHistoryContext,
  );
  const { representatives } = React.useContext(RepresentativesOnlineContext);
  const {
    nodeStatus: { ledgerSize },
    isLoading: isNodeStatusLoading,
  } = React.useContext(NodeStatusContext);

  const btcTransactionFees24h =
    marketStatistics[TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H] && btcCurrentPrice
      ? new BigNumber(marketStatistics[TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H])
          .times(btcCurrentPrice)
          .toFixed(CurrencyDecimal?.[fiat])
      : 0;

  const btcTransactionFeesChange24h = btcTransactionFees24h
    ? new BigNumber(marketStatistics[TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H])
        .minus(marketStatistics[TOTAL_BITCOIN_TRANSACTION_FEES_KEY_48H])
        .dividedBy(marketStatistics[TOTAL_BITCOIN_TRANSACTION_FEES_KEY_48H])
        .times(100)
        .toNumber()
    : 0;

  let onChainVolume48hAgo = 0;
  let onChainVolumeChange24h = 0;
  if (
    marketStatistics[TOTAL_NANO_VOLUME_KEY_24H] &&
    marketStatistics[TOTAL_NANO_VOLUME_KEY_48H]
  ) {
    onChainVolume48hAgo = new BigNumber(
      marketStatistics[TOTAL_NANO_VOLUME_KEY_48H],
    )
      .minus(marketStatistics[TOTAL_NANO_VOLUME_KEY_24H])
      .toNumber();
    onChainVolumeChange24h = new BigNumber(
      marketStatistics[TOTAL_NANO_VOLUME_KEY_24H],
    )
      .minus(onChainVolume48hAgo)
      .dividedBy(onChainVolume48hAgo)
      .times(100)
      .toNumber();
  }

  let totalConfirmations48hAgo = 0;
  let confirmationChange24h = 0;
  if (
    marketStatistics[TOTAL_CONFIRMATIONS_KEY_24H] &&
    marketStatistics[TOTAL_CONFIRMATIONS_KEY_48H]
  ) {
    totalConfirmations48hAgo = new BigNumber(
      marketStatistics[TOTAL_CONFIRMATIONS_KEY_48H],
    )
      .minus(marketStatistics[TOTAL_CONFIRMATIONS_KEY_24H])
      .toNumber();
    confirmationChange24h = new BigNumber(
      marketStatistics[TOTAL_CONFIRMATIONS_KEY_24H],
    )
      .minus(totalConfirmations48hAgo)
      .dividedBy(totalConfirmations48hAgo)
      .times(100)
      .toNumber();
  }

  return (
    <>
      <Row
        gutter={[{ xs: 6, sm: 12, md: 12, lg: 12 }, 12]}
        style={{ marginBottom: "12px" }}
      >
        <Col sm={24} md={12} style={{ width: "100%" }}>
          <Card size="small" title={t("pages.home.statistics")}>
            <Skeleton active loading={false}>
              <Row gutter={6}>
                <Col xs={24} sm={12}>
                  <LoadingStatistic
                    isLoading={isMarketStatisticsInitialLoading}
                    title={t("pages.home.marketCapRank")}
                    prefix="#"
                    suffix={
                      marketCapRank24h ? (
                        <StatisticsChange
                          value={marketCapRank24h - marketCapRank}
                          isNumber
                          isArrow
                        />
                      ) : null
                    }
                    value={`${marketCapRank}`}
                  />
                  <LoadingStatistic
                    isLoading={isMarketStatisticsInitialLoading}
                    title={`${t(
                      "pages.home.marketCap",
                    )} (${fiat.toUpperCase()})`}
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
                    isLoading={isMarketStatisticsInitialLoading}
                    title={t("pages.home.circulatingSupply")}
                    value={new BigNumber(circulatingSupply).toNumber()}
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <LoadingStatistic
                    isLoading={!count}
                    title={t("pages.home.latestBlock")}
                    value={count}
                  />
                  <LoadingStatistic
                    isLoading={!representatives.length}
                    title={t("pages.home.principalRepOnline")}
                    value={representatives.length}
                  />

                  <LoadingStatistic
                    isLoading={isNodeStatusLoading}
                    title={t("pages.home.ledgerSize")}
                    suffix="GB"
                    value={new BigNumber(ledgerSize)
                      .dividedBy(1000e6)
                      .toFormat(2)}
                  />
                </Col>
              </Row>
            </Skeleton>
          </Card>
        </Col>
        <Col sm={24} md={12} style={{ width: "100%" }}>
          <Card size="small" title={t("pages.home.last24Hours")}>
            <Skeleton active loading={false}>
              <Row gutter={6}>
                <Col xs={24} sm={12}>
                  <LoadingStatistic
                    isLoading={!average}
                    title={t("pages.home.avgConfirmationTime")}
                    tooltip={t("tooltips.avgConfirmationTime")}
                    value={new BigNumber(average).dividedBy(1000).toNumber()}
                  />
                  <LoadingStatistic
                    isLoading={isMarketStatisticsInitialLoading}
                    title={t("pages.home.confirmedTransactions")}
                    suffix={
                      <StatisticsChange
                        value={confirmationChange24h}
                        isPercent
                      />
                    }
                    value={marketStatistics[TOTAL_CONFIRMATIONS_KEY_24H]}
                  />
                  <Statistic
                    title={t("pages.home.nanoTransactionFees")}
                    value={0}
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <LoadingStatistic
                    isLoading={isMarketStatisticsInitialLoading}
                    title={`${t(
                      "pages.home.exchangeVolume",
                    )} (${fiat.toUpperCase()})`}
                    prefix={CurrencySymbol?.[fiat]}
                    value={`${new BigNumber(volume24h).toNumber()}`}
                  />
                  <LoadingStatistic
                    isLoading={isMarketStatisticsInitialLoading}
                    title={t("pages.home.onChainVolume")}
                    suffix={
                      <StatisticsChange
                        value={onChainVolumeChange24h}
                        isPercent
                      />
                    }
                    value={new BigNumber(
                      marketStatistics[TOTAL_NANO_VOLUME_KEY_24H],
                    )
                      .decimalPlaces(5)
                      .toNumber()}
                  />
                  <LoadingStatistic
                    isLoading={isMarketStatisticsInitialLoading}
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
            </Skeleton>
          </Card>
        </Col>
      </Row>
      <RecentTransactions />
    </>
  );
};

export default HomePage;
