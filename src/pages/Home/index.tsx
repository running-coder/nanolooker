import React from "react";
import { Card, Col, Row, Skeleton, Statistic } from "antd";
import BigNumber from "bignumber.js";
import { BlockCountContext } from "api/contexts/BlockCount";
import { CoingeckoContext } from "api/contexts/Coingecko";
import { ConfirmationHistoryContext } from "api/contexts/ConfirmationHistory";
import { RepresentativesOnlineContext } from "api/contexts/RepresentativesOnline";
import { NodeStatusContext } from "api/contexts/NodeStatus";
import {
  TOTAL_CONFIRMATION_KEY_24H,
  TOTAL_CONFIRMATION_KEY_48H,
  TOTAL_NANO_VOLUME_KEY_24H,
  TOTAL_NANO_VOLUME_KEY_48H,
  TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H,
  TOTAL_BITCOIN_TRANSACTION_FEES_KEY_48H
} from "api/hooks/use-statistics-24h";
import useStatistics24h from "api/hooks/use-statistics-24h";
import LoadingStatistic from "components/LoadingStatistic";
import PercentChange from "components/PercentChange";
import { rawToRai } from "components/utils";
import RecentTransactions from "./RecentTransactions";

const HomePage = () => {
  const {
    marketCapRank,
    usdMarketCap,
    marketCapChangePercentage24h,
    usd24hVolume,
    circulatingSupply,
    isInitialLoading: isCoingeckoDataInitialLoading
  } = React.useContext(CoingeckoContext);
  const { count } = React.useContext(BlockCountContext);
  const { confirmation_stats: { average = 0 } = {} } = React.useContext(
    ConfirmationHistoryContext
  );
  const { representatives } = React.useContext(RepresentativesOnlineContext);
  const {
    nodeStatus: { ledgerSize },
    isLoading: isNodeStatusLoading
  } = React.useContext(NodeStatusContext);
  const statistics24h = useStatistics24h();
  const { usdBtcCurrentPrice = 0 } = React.useContext(CoingeckoContext);

  const btcTransactionFees24h =
    statistics24h[TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H] && usdBtcCurrentPrice
      ? new BigNumber(statistics24h[TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H])
          .times(usdBtcCurrentPrice)
          .toFormat(2)
      : 0;

  const btcTransactionFeesChange24h = btcTransactionFees24h
    ? new BigNumber(statistics24h[TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H])
        .minus(statistics24h[TOTAL_BITCOIN_TRANSACTION_FEES_KEY_48H])
        .dividedBy(statistics24h[TOTAL_BITCOIN_TRANSACTION_FEES_KEY_48H])
        .times(100)
        .toNumber()
    : 0;

  const onChainVolumeChange24h = statistics24h[TOTAL_NANO_VOLUME_KEY_24H]
    ? new BigNumber(statistics24h[TOTAL_NANO_VOLUME_KEY_24H])
        .minus(statistics24h[TOTAL_NANO_VOLUME_KEY_48H])
        .dividedBy(statistics24h[TOTAL_NANO_VOLUME_KEY_48H])
        .times(100)
        .toNumber()
    : 0;

  const confirmationChange24h = statistics24h[TOTAL_CONFIRMATION_KEY_24H]
    ? new BigNumber(statistics24h[TOTAL_CONFIRMATION_KEY_24H])
        .minus(statistics24h[TOTAL_CONFIRMATION_KEY_48H])
        .dividedBy(statistics24h[TOTAL_CONFIRMATION_KEY_48H])
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
                    isLoading={isCoingeckoDataInitialLoading}
                    title="Market cap rank"
                    prefix="#"
                    value={`${marketCapRank}`}
                  />
                  <LoadingStatistic
                    isLoading={isCoingeckoDataInitialLoading}
                    title="Market cap (USD)"
                    prefix="$"
                    suffix={
                      <PercentChange percent={marketCapChangePercentage24h} />
                    }
                    value={`${new BigNumber(usdMarketCap).toNumber()}`}
                  />
                  <LoadingStatistic
                    isLoading={isCoingeckoDataInitialLoading}
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
                    isLoading={!statistics24h[TOTAL_CONFIRMATION_KEY_24H]}
                    title="Confirmed transactions"
                    suffix={<PercentChange percent={confirmationChange24h} />}
                    value={statistics24h[TOTAL_CONFIRMATION_KEY_24H]}
                  />
                  <Statistic title="NANO transaction fees" value="Always 0" />
                </Col>
                <Col xs={24} sm={12}>
                  <LoadingStatistic
                    isLoading={isCoingeckoDataInitialLoading}
                    title="Exchange volume (USD)"
                    prefix="$"
                    value={`${new BigNumber(usd24hVolume).toNumber()}`}
                  />
                  <LoadingStatistic
                    isLoading={!statistics24h[TOTAL_NANO_VOLUME_KEY_24H]}
                    title="On-chain NANO volume"
                    suffix={<PercentChange percent={onChainVolumeChange24h} />}
                    value={rawToRai(
                      new BigNumber(
                        statistics24h[TOTAL_NANO_VOLUME_KEY_24H]
                      ).toNumber()
                    )}
                  />
                  <LoadingStatistic
                    isLoading={!btcTransactionFees24h}
                    title="Bitcoin transaction fees paid to miners"
                    value={`$${btcTransactionFees24h}`}
                    suffix={
                      <PercentChange percent={btcTransactionFeesChange24h} />
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
