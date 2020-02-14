import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Col,
  Icon,
  List,
  Popover,
  Row,
  Skeleton,
  Statistic,
  Switch,
  Tag,
  Timeline,
  Typography
} from "antd";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import BigNumber from "bignumber.js";
import TimeAgo from "timeago-react";
import { BlockCountContext } from "api/contexts/BlockCount";
import { CoingeckoContext } from "api/contexts/Coingecko";
import { ConfirmationHistoryContext } from "api/contexts/ConfirmationHistory";
import { RepresentativesOnlineContext } from "api/contexts/RepresentativesOnline";
import { Statistics24hContext, TOTAL_CONFIRMATION_KEY_24H, TOTAL_NANO_VOLUME_KEY_24H, TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H } from "api/contexts/Statistics24h";
import useSockets from "api/hooks/use-socket";
import { Colors, TwoToneColors } from "components/utils";
import { rawToRai } from "components/utils";

const { Text } = Typography;

const HomePage = () => {
  const {
    recentTransactions,
    isConnected,
    setIsMinAmount,
    isDisabled,
    setIsDisabled
  } = useSockets();
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
    // confirmations
  } = React.useContext(ConfirmationHistoryContext);
  const { representatives } = React.useContext(RepresentativesOnlineContext);
  const statistics24h = React.useContext(Statistics24hContext);
  const { usdBtcCurrentPrice = 0 } = React.useContext(
    CoingeckoContext
  );

  const isMediumAndLower = !useMediaQuery("(min-width: 768px)");
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
      <Card
        size="small"
        title="Recent Transactions"
        extra={
          <Popover
            placement="left"
            content={
              <List size="small">
                <List.Item>
                  <Text style={{ marginRight: "16px" }}>
                    Enable Live updates
                  </Text>
                  <Switch
                    checkedChildren={<Icon type="check" />}
                    unCheckedChildren={<Icon type="close" />}
                    onChange={(checked: boolean) => {
                      setIsDisabled(!checked);
                    }}
                    defaultChecked
                  />
                </List.Item>
                <List.Item>
                  <Text style={{ marginRight: "16px" }}>
                    Include amounts under 1 NANO
                  </Text>
                  <Switch
                    checkedChildren={<Icon type="check" />}
                    unCheckedChildren={<Icon type="close" />}
                    onChange={(checked: boolean) => {
                      setIsMinAmount(!checked);
                    }}
                    defaultChecked
                  />
                </List.Item>
              </List>
            }
            trigger="click"
          >
            <Icon type="setting" />
          </Popover>
        }
      >
        <div style={{ margin: "1em 0" }}>
          {isDisabled ? (
            <div style={{ textAlign: "center" }}>
              <Icon
                type="close-circle"
                theme="twoTone"
                twoToneColor={TwoToneColors.SEND}
              />
              <Text style={{ marginLeft: "8px" }}>Live updates disabled</Text>
            </div>
          ) : null}
          {isConnected && !isDisabled && !recentTransactions.length ? (
            <div style={{ textAlign: "center" }}>
              <Icon type="sync" spin />
              <Text style={{ marginLeft: "8px" }}>
                Waiting for transactions ...
              </Text>
            </div>
          ) : null}
          {!isConnected ? (
            <div style={{ textAlign: "center" }}>
              <Icon type="sync" spin />
              <Text style={{ marginLeft: "8px" }}>
                Connecting to the NANO blockchain ...
              </Text>
            </div>
          ) : null}
          {recentTransactions.length ? (
            <Timeline
              mode={isMediumAndLower ? "left" : "alternate"}
              style={{ marginTop: isDisabled ? "24px" : 0 }}
            >
              {recentTransactions.map(
                ({ account, amount, hash, timestamp, block: { subtype } }) => {
                  // @ts-ignore
                  const color = Colors[subtype.toUpperCase()];

                  return (
                    <Timeline.Item
                      color={color}
                      key={hash}
                      className={`fadein ${
                        subtype === "send" ? "right" : "left"
                        }`}
                    >
                      <div className="first-row">
                        <Tag
                          // @ts-ignore
                          color={TwoToneColors[subtype.toUpperCase()]}
                          className="timeline-tag"
                        >
                          {subtype}
                        </Tag>
                        {subtype !== "change" ? (
                          <Text style={{ color }} className="timeline-amount">
                            {amount
                              ? `${new BigNumber(
                                rawToRai(amount)
                              ).toFormat()} NANO`
                              : "N/A"}
                          </Text>
                        ) : null}
                        <TimeAgo
                          datetime={timestamp}
                          live={true}
                          className="timeline-timeago color-muted"
                          style={{
                            marginLeft: subtype === "change" ? "6px" : 0
                          }}
                        />
                      </div>
                      <Link to={`/account/${account}`} className="color-normal">
                        {account}
                      </Link>
                      <br />
                      <Link to={`/block/${hash}`} className="color-muted">
                        {hash}
                      </Link>
                    </Timeline.Item>
                  );
                }
              )}
            </Timeline>
          ) : null}
        </div>
      </Card>
    </>
  );
};

export default HomePage;
