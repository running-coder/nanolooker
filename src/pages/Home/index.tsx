import React from "react";
import { Card, Col, Row, Skeleton, Statistic } from "antd";
import BigNumber from "bignumber.js";
import { BlockCountContext } from "api/contexts/BlockCount";
import { CoingeckoContext } from "api/contexts/Coingecko";
import { ConfirmationHistoryContext } from "api/contexts/ConfirmationHistory";
import { RepresentativesOnlineContext } from "api/contexts/RepresentativesOnline";
// import { StatsContext } from "api/contexts/Stats";
import {
  TOTAL_CONFIRMATION_KEY_24H,
  TOTAL_NANO_VOLUME_KEY_24H,
  TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H
} from "api/hooks/use-statistics-24h";
import useStatistics24h from "api/hooks/use-statistics-24h";
import LoadingStatistic from "components/LoadingStatistic";
import { rawToRai } from "components/utils";
import RecentTransactions from "./RecentTransactions";

const HomePage = () => {
  const {
    marketCapRank,
    usdMarketCap,
    usd24hVolume,
    circulatingSupply
  } = React.useContext(CoingeckoContext);
  const { count } = React.useContext(BlockCountContext);
  const {
    // @TODO why define default here?
    confirmation_stats: { average = 0 } = {}
  } = React.useContext(ConfirmationHistoryContext);
  const { representatives } = React.useContext(RepresentativesOnlineContext);
  // const statistics24h = React.useContext(Statistics24hContext);
  const statistics24h = useStatistics24h();
  const { usdBtcCurrentPrice = 0 } = React.useContext(CoingeckoContext);
  // @TODO get stats from another way
  // const { stats } = React.useContext(
  //   StatsContext
  // );

  const btcTransactionFees =
    statistics24h[TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H] && usdBtcCurrentPrice
      ? new BigNumber(statistics24h[TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H])
          .times(usdBtcCurrentPrice)
          .toFormat(2)
      : 0;

  const isCoingeckoDataLoading: boolean =
    !marketCapRank || !usdMarketCap || !usd24hVolume || !circulatingSupply;

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
                    isLoading={isCoingeckoDataLoading}
                    title="Market cap rank"
                  >
                    <Statistic prefix="#" value={`${marketCapRank}`} />
                  </LoadingStatistic>
                  <LoadingStatistic
                    isLoading={isCoingeckoDataLoading}
                    title="Market cap (USD)"
                  >
                    <Statistic
                      prefix="$"
                      value={`${new BigNumber(usdMarketCap).toNumber()}`}
                    />
                  </LoadingStatistic>
                  <LoadingStatistic
                    isLoading={isCoingeckoDataLoading}
                    title="Circulating Supply"
                  >
                    <Statistic
                      value={new BigNumber(circulatingSupply).toNumber()}
                    />
                  </LoadingStatistic>
                </Col>
                <Col xs={24} sm={12}>
                  <LoadingStatistic isLoading={!count} title="Latest block">
                    <Statistic value={count} />
                  </LoadingStatistic>
                  <LoadingStatistic
                    isLoading={false}
                    title="Principal Representatives Online"
                  >
                    <Statistic value={representatives.length} />
                  </LoadingStatistic>
                  <Statistic title="Blockchain size" value="TBD" />
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
                  >
                    <Statistic
                      value={new BigNumber(average).dividedBy(1000).toNumber()}
                    />
                  </LoadingStatistic>
                  <LoadingStatistic
                    isLoading={!statistics24h[TOTAL_CONFIRMATION_KEY_24H]}
                    title="Confirmed transactions"
                  >
                    <Statistic
                      value={statistics24h[TOTAL_CONFIRMATION_KEY_24H]}
                    />
                  </LoadingStatistic>
                  <Statistic title="NANO transaction fees" value="Always 0" />
                </Col>
                <Col xs={24} sm={12}>
                  <LoadingStatistic
                    isLoading={isCoingeckoDataLoading}
                    title="Exchange volume (USD)"
                  >
                    <Statistic
                      prefix="$"
                      value={`${new BigNumber(usd24hVolume).toNumber()}`}
                    />
                  </LoadingStatistic>
                  <LoadingStatistic
                    isLoading={!statistics24h[TOTAL_NANO_VOLUME_KEY_24H]}
                    title="On-chain NANO volume"
                  >
                    <Statistic
                      value={rawToRai(
                        new BigNumber(
                          statistics24h[TOTAL_NANO_VOLUME_KEY_24H]
                        ).toNumber()
                      )}
                    />
                  </LoadingStatistic>
                  <LoadingStatistic
                    isLoading={!btcTransactionFees}
                    title="Bitcoin transaction fees paid to miners"
                  >
                    <Statistic value={`$${btcTransactionFees}`} />
                  </LoadingStatistic>
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
