import React from "react";
import {
  Card,
  Col,
  Row,
  Skeleton,
  Statistic,
} from "antd";
import BigNumber from "bignumber.js";
import { BlockCountContext } from "api/contexts/BlockCount";
import { CoingeckoContext } from "api/contexts/Coingecko";
import { ConfirmationHistoryContext } from "api/contexts/ConfirmationHistory";
import { RepresentativesOnlineContext } from "api/contexts/RepresentativesOnline";
// import { StatsContext } from "api/contexts/Stats";
import { Statistics24hContext, TOTAL_CONFIRMATION_KEY_24H, TOTAL_NANO_VOLUME_KEY_24H, TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H } from "api/contexts/Statistics24h";
import { rawToRai } from "components/utils";
import RecentTransactions from './RecentTransactions';

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
    confirmation_stats: { average = "0" } = {}
  } = React.useContext(ConfirmationHistoryContext);
  const { representatives } = React.useContext(RepresentativesOnlineContext);
  const statistics24h = React.useContext(Statistics24hContext);
  const { usdBtcCurrentPrice = 0 } = React.useContext(
    CoingeckoContext
  );
  // @TODO get stats from another way
  // const { stats } = React.useContext(
  //   StatsContext
  // );

  const btcTransactionFees = new BigNumber(statistics24h[TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H]).times(usdBtcCurrentPrice).toFormat(2)

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
                  <Statistic
                    title="Market cap rank"
                    value={`#${marketCapRank}`}
                  />
                  <Statistic
                    title="Market cap (USD)"
                    value={`$${new BigNumber(usdMarketCap).toFormat()}`}
                  />
                  <Statistic
                    title="Circulating Supply"
                    value={new BigNumber(circulatingSupply).toFormat()}
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <Statistic title="Latest block" value={count} />
                  <Statistic
                    title="Principal Representatives Online"
                    value={representatives.length}
                  />
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
                  <Statistic
                    title="Avg. confirmation time (seconds)"
                    value={new BigNumber(average).dividedBy(1000).toFormat()}
                  />
                  <Statistic title="Confirmed transactions" value={statistics24h[TOTAL_CONFIRMATION_KEY_24H]} />
                  <Statistic title="NANO transaction fees" value="Always 0" />
                </Col>
                <Col xs={24} sm={12}>
                  <Statistic
                    title="Exchange volume (USD)"
                    value={`$${new BigNumber(usd24hVolume).toFormat()}`}
                  />
                  <Statistic title="On-chain NANO volume" value={rawToRai(new BigNumber(statistics24h[TOTAL_NANO_VOLUME_KEY_24H]).toNumber())} />
                  <Statistic title="Bitcoin transaction fees paid to miners" value={`$${btcTransactionFees}`} />
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
