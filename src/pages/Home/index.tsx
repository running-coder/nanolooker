import React from "react";
import { Card, Col, Row, Skeleton, Statistic } from "antd";
import BigNumber from "bignumber.js";
import { BlockCountContext } from "api/contexts/BlockCount";
import { ConfirmationHistoryContext } from "api/contexts/ConfirmationHistory";
import { RepresentativesOnlineContext } from "api/contexts/RepresentativesOnline";
import { NodeStatusContext } from "api/contexts/NodeStatus";
import {
  MarketStatisticsContext,
  TOTAL_CONFIRMATION_KEY_24H,
  TOTAL_CONFIRMATION_KEY_48H,
  TOTAL_NANO_VOLUME_KEY_24H,
  TOTAL_NANO_VOLUME_KEY_48H,
  TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H,
  TOTAL_BITCOIN_TRANSACTION_FEES_KEY_48H
} from "api/contexts/MarketStatistics";
import LoadingStatistic from "components/LoadingStatistic";
import StatisticsChange from "components/StatisticsChange";
import { rawToRai } from "components/utils";
import RecentTransactions from "./RecentTransactions";

const HomePage = () => {
  const {
    marketStatistics,
    isInitialLoading: isMarketStatisticsInitialLoading
  } = React.useContext(MarketStatisticsContext);
  const {
    marketCapRank,
    marketCapRank24h,
    usdMarketCap,
    marketCapChangePercentage24h,
    usd24hVolume,
    circulatingSupply,
    usdBtcCurrentPrice
  } = marketStatistics;

  const { count } = React.useContext(BlockCountContext);
  const { confirmation_stats: { average = 0 } = {} } = React.useContext(
    ConfirmationHistoryContext
  );
  const { representatives } = React.useContext(RepresentativesOnlineContext);
  const {
    nodeStatus: { ledgerSize },
    isLoading: isNodeStatusLoading
  } = React.useContext(NodeStatusContext);

  const btcTransactionFees24h =
    marketStatistics[TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H] &&
    usdBtcCurrentPrice
      ? new BigNumber(marketStatistics[TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H])
          .times(usdBtcCurrentPrice)
          .toFixed(2)
      : 0;

  const btcTransactionFeesChange24h = btcTransactionFees24h
    ? new BigNumber(marketStatistics[TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H])
        .minus(marketStatistics[TOTAL_BITCOIN_TRANSACTION_FEES_KEY_48H])
        .dividedBy(marketStatistics[TOTAL_BITCOIN_TRANSACTION_FEES_KEY_48H])
        .times(100)
        .toNumber()
    : 0;

  const onChainVolumeChange24h = marketStatistics[TOTAL_NANO_VOLUME_KEY_24H]
    ? new BigNumber(marketStatistics[TOTAL_NANO_VOLUME_KEY_24H])
        .minus(marketStatistics[TOTAL_NANO_VOLUME_KEY_48H])
        .dividedBy(marketStatistics[TOTAL_NANO_VOLUME_KEY_48H])
        .times(100)
        .toNumber()
    : 0;

  const confirmationChange24h = marketStatistics[TOTAL_CONFIRMATION_KEY_24H]
    ? new BigNumber(marketStatistics[TOTAL_CONFIRMATION_KEY_24H])
        .minus(marketStatistics[TOTAL_CONFIRMATION_KEY_48H])
        .dividedBy(marketStatistics[TOTAL_CONFIRMATION_KEY_48H])
        .times(100)
        .toNumber()
    : 0;

  return (
    <>
      <Row
        gutter={[{ xs: 6, sm: 12, md: 12, lg: 12 }, 12]}
        style={{ marginBottom: "12px" }}
      >
        <Col sm={24} md={12}>
          <Card size="small" title="Statistics">
            <Skeleton active loading={false}>
              <Row gutter={6}>
                <Col xs={24} sm={12}>
                  <LoadingStatistic
                    isLoading={isMarketStatisticsInitialLoading}
                    title="Market cap rank"
                    prefix="#"
                    suffix={
                      <StatisticsChange
                        value={marketCapRank24h - marketCapRank}
                        isNumber
                      />
                    }
                    value={`${marketCapRank}`}
                  />
                  <LoadingStatistic
                    isLoading={isMarketStatisticsInitialLoading}
                    title="Market cap (USD)"
                    prefix="$"
                    suffix={
                      <StatisticsChange
                        value={marketCapChangePercentage24h}
                        isPercent
                      />
                    }
                    value={`${new BigNumber(usdMarketCap).toNumber()}`}
                  />
                  <LoadingStatistic
                    isLoading={isMarketStatisticsInitialLoading}
                    title="Circulating Supply"
                    value={new BigNumber(circulatingSupply).toNumber()}
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <LoadingStatistic
                    isLoading={!count}
                    title="Latest block"
                    value={count}
                  />
                  <LoadingStatistic
                    isLoading={!representatives.length}
                    title="Principal Representatives Online"
                    value={representatives.length}
                  />

                  <LoadingStatistic
                    isLoading={isNodeStatusLoading}
                    title="Blockchain size"
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
        <Col sm={24} md={12}>
          <Card size="small" title="Last 24 hours">
            <Skeleton active loading={false}>
              <Row gutter={6}>
                <Col xs={24} sm={12}>
                  <LoadingStatistic
                    isLoading={!average}
                    title="Avg. confirmation time (seconds)"
                    value={new BigNumber(average).dividedBy(1000).toNumber()}
                  />
                  <LoadingStatistic
                    isLoading={isMarketStatisticsInitialLoading}
                    title="Confirmed transactions"
                    suffix={
                      <StatisticsChange
                        value={confirmationChange24h}
                        isPercent
                      />
                    }
                    value={marketStatistics[TOTAL_CONFIRMATION_KEY_24H]}
                  />
                  <Statistic title="NANO transaction fees" value="Always 0" />
                </Col>
                <Col xs={24} sm={12}>
                  <LoadingStatistic
                    isLoading={isMarketStatisticsInitialLoading}
                    title="Exchange volume (USD)"
                    prefix="$"
                    value={`${new BigNumber(usd24hVolume).toNumber()}`}
                  />
                  <LoadingStatistic
                    isLoading={isMarketStatisticsInitialLoading}
                    title="On-chain NANO volume"
                    suffix={
                      <StatisticsChange
                        value={onChainVolumeChange24h}
                        isPercent
                      />
                    }
                    value={rawToRai(
                      new BigNumber(
                        marketStatistics[TOTAL_NANO_VOLUME_KEY_24H]
                      ).toNumber()
                    )}
                  />
                  <LoadingStatistic
                    isLoading={isMarketStatisticsInitialLoading}
                    title="Bitcoin transaction fees paid to miners"
                    prefix="$"
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
