import * as React from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import {Button, Card, Row, Col, Skeleton, Space, Typography, Tabs, Divider, Tooltip} from "antd";
import { Tracker } from "components/utils/analytics";
import QRCodeModal from "../../components/QRCode/Modal";
import useRaiblocksMCInfo from "./hooks/use-raiblocksmc-info";
import useRaiblocksMCLeaderboards from "./hooks/use-raiblocksmc-leaderboards";
import {PreferencesContext, Theme} from "../../api/contexts/Preferences";
import TreasureHuntLeaderboard from "./leaderboards/treasure-hunt";
import MarketLeaderboard from "./leaderboards/market";
import PvpLeaderboard from "./leaderboards/pvp";
import ReferralLeaderboard from "./leaderboards/referral";
import QuestionCircle from "../../components/QuestionCircle";


export const RAIBLOCKSMC_DONATION_ACCOUNT = "nano_1boirkfg4ga3m1t9g3z5ocrgozmzh8e1unqgz5y8c3zcgiy3hepss1uizxtr";
const { Text, Title } = Typography;


const RaiblocksMCPage: React.FC = () => {
  const { t } = useTranslation();
  const { statistics } = useRaiblocksMCInfo();
  const { leaderboards } = useRaiblocksMCLeaderboards();
  const { theme } = React.useContext(PreferencesContext);

  console.log("~~~~statistics", statistics);
  console.log("~~~~leaderboards", leaderboards);

  // @ts-ignore
  // @ts-ignore
  return (
    <>
      <Helmet>
        <title>{t("pages.raiblocksmc.playRaiblocksMC")}</title>
      </Helmet>
      <Row gutter={[12, 0]}>
        <Col xs={24} md={12}>
          <Title level={3}>
            RaiblocksMC{" "}
            <span
              className="color-muted"
              style={{
                fontSize: "12px",
              }}
            >
              {t("common.by")} Pride
            </span>
          </Title>
          <Card size="small" bordered={false} className="detail-layout">
            <Row gutter={[12, 0]}>
              <Col xs={24}>
                <Space size={12}>
                  <Text style={{ textTransform: "uppercase" }}>
                    {t("pages.raiblocksmc.serverStatus")}:
                  </Text>

                  <Skeleton
                    paragraph={false}
                    loading={!statistics}
                    active
                    title={{ width: "50px" }}
                  >
                    {Object.keys(statistics).length === 0 && "Server is offline"}
                    {statistics.serverStatus}
                  </Skeleton>
                </Space>
              </Col>
            </Row>
            <Row>
              <Col xs={24}>
                <Space size={12} align="center" direction="vertical">
                  <img
                    src="/raiblocksmc/banner.png"
                    alt="RaiblocksMC"
                    width="100%"
                    style={{
                      display: "block",
                      pointerEvents: "none",
                      margin: "0 auto",
                    }}
                  />

                  <Button
                    type="primary"
                    size="large"
                    shape="round"
                    href={`https://raiblocksmc.com/`}
                    target={"_blank"}
                    onClick={() => {
                      Tracker.ga4?.gtag("event", "RaiblocksMC - Play");
                    }}
                  >
                    {t("pages.raiblocksmc.playNow")}
                  </Button>

                  <Text style={{ display: "block", margin: "12px 0" }}>
                    {t("pages.raiblocksmc.gameDescription")}
                  </Text>

                  <QRCodeModal
                      account={RAIBLOCKSMC_DONATION_ACCOUNT}
                      header={<Text>RaiblocksMC</Text>}>
                    <Button ghost type="primary" size="small" shape="round">
                      {t("pages.raiblocksmc.donatePrizePool")}
                    </Button>
                  </QRCodeModal>

                  <Text style={{ display: "block", margin: "12px 0" }}>
                    {t("pages.raiblocksmc.whyDonate")}
                  </Text>
                </Space>
              </Col>
            </Row>
          </Card>

          {Object.keys(statistics).length !== 0 &&
              <Card size="small" bordered={false} className="detail-layout">
                <Title level={4}>{t("pages.raiblocksmc.statsDividers.server")}</Title>
                <Row gutter={6}>
                  <Col xs={24} sm={6}>
                    {t("pages.raiblocksmc.onlinePlayers")}
                  </Col>
                  <Col xs={24} sm={18}>
                    <Skeleton
                        paragraph={false}
                        loading={!statistics}
                        active
                        title={{ width: "50%" }}
                    >
                      {statistics?.onlinePlayers?.join(", ")}
                    </Skeleton>
                  </Col>
                </Row>
                <Row gutter={6}>
                  <Col xs={24} sm={6}>
                    {t("pages.raiblocksmc.playersRegistered")}
                  </Col>
                  <Col xs={24} sm={18}>
                    <Skeleton
                        paragraph={false}
                        loading={!statistics}
                        active
                        title={{ width: "25%" }}
                    >
                      {statistics?.playersRegistered}
                    </Skeleton>
                  </Col>
                </Row>
                <Row gutter={6}>
                  <Col xs={24} sm={6}>
                    {t("pages.raiblocksmc.numberOfTransactions")}
                  </Col>
                  <Col xs={24} sm={18}>
                    <Skeleton
                        paragraph={false}
                        loading={!statistics}
                        active
                        title={{ width: "25%" }}
                    >
                      {statistics?.numberOfTransactions}
                    </Skeleton>
                  </Col>
                </Row>
                <Row gutter={6}>
                  <Col xs={24} sm={6}>
                    {t("pages.raiblocksmc.activePlayers7d")}
                  </Col>
                  <Col xs={24} sm={18}>
                    <Skeleton
                        paragraph={false}
                        loading={!statistics}
                        active
                        title={{ width: "25%" }}
                    >
                      {statistics?.activePlayers7d}
                    </Skeleton>
                  </Col>
                </Row>

                <Divider/>
                <Title level={4}>{t("pages.raiblocksmc.statsDividers.treasure")}
                  <Tooltip placement="right"
                           title={t("pages.raiblocksmc.tooltips.treasure") + ` Ӿ ${statistics?.treasureHuntIncreaseRate}`}>
                    <QuestionCircle />
                  </Tooltip>
                </Title>

                <Row gutter={6}>
                  <Col xs={24} sm={6}>
                    {t("pages.raiblocksmc.treasureHuntReward")}
                  </Col>
                  <Col xs={24} sm={18}>
                    <Skeleton
                        paragraph={false}
                        loading={!statistics}
                        active
                        title={{ width: "25%" }}
                    >
                      Ӿ {statistics?.treasureHuntReward}
                    </Skeleton>
                  </Col>
                </Row>
                <Row gutter={6}>
                  <Col xs={24} sm={6}>
                    {t("pages.raiblocksmc.treasureHuntResetIn")}
                  </Col>
                  <Col xs={24} sm={18}>
                    <Skeleton
                        paragraph={false}
                        loading={!statistics}
                        active
                        title={{ width: "25%" }}
                    >
                      {statistics?.treasureHuntResetIn}
                    </Skeleton>
                  </Col>
                </Row>
                <Row gutter={6}>
                  <Col xs={24} sm={6}>
                    {t("pages.raiblocksmc.treasureHuntCoordinates")}
                  </Col>
                  <Col xs={24} sm={18}>
                    <Skeleton
                        paragraph={false}
                        loading={!statistics}
                        active
                        title={{ width: "25%" }}
                    >
                      <a
                          href={statistics?.treasureHuntDynmap?.toString()}
                          rel="noopener noreferrer"
                          target="_blank"
                      >
                        {statistics?.treasureHuntCoordinates}
                      </a>
                    </Skeleton>
                  </Col>
                </Row>
                <Row gutter={6}>
                  <Col xs={24} sm={6}>
                    {t("pages.raiblocksmc.treasureHuntTotalPayout")}
                  </Col>
                  <Col xs={24} sm={18}>
                    <Skeleton
                        paragraph={false}
                        loading={!statistics}
                        active
                        title={{ width: "25%" }}
                    >
                      Ӿ {statistics?.treasureHuntTotalPayout}
                    </Skeleton>
                  </Col>
                </Row>

                <Divider/>
                <Title level={4} >{t("pages.raiblocksmc.statsDividers.market")}
                  <Tooltip placement="right"
                           title={t("pages.raiblocksmc.tooltips.market")}>
                    <QuestionCircle />
                  </Tooltip>
                </Title>
                <Row gutter={6}>
                  <Col xs={24} sm={6}>
                    {t("pages.raiblocksmc.numberOfShops")}
                  </Col>
                  <Col xs={24} sm={18}>
                    <Skeleton
                        paragraph={false}
                        loading={!statistics}
                        active
                        title={{ width: "25%" }}
                    >
                      {statistics?.numberOfShops}
                    </Skeleton>
                  </Col>
                </Row>
                <Row gutter={6}>
                  <Col xs={24} sm={6}>
                    {t("pages.raiblocksmc.numberOfItemsListed")}
                  </Col>
                  <Col xs={24} sm={18}>
                    <Skeleton
                        paragraph={false}
                        loading={!statistics}
                        active
                        title={{ width: "25%" }}
                    >
                      {statistics?.numberOfItemsListed}
                    </Skeleton>
                  </Col>
                </Row>
                <Row gutter={6}>
                  <Col xs={24} sm={6}>
                    {t("pages.raiblocksmc.numberOfItemsSold")}
                  </Col>
                  <Col xs={24} sm={18}>
                    <Skeleton
                        paragraph={false}
                        loading={!statistics}
                        active
                        title={{ width: "25%" }}
                    >
                      {statistics?.numberOfItemsSold}
                    </Skeleton>
                  </Col>
                </Row>
                <Row gutter={6}>
                  <Col xs={24} sm={6}>
                    {t("pages.raiblocksmc.totalShopRevenues")}
                  </Col>
                  <Col xs={24} sm={18}>
                    <Skeleton
                        paragraph={false}
                        loading={!statistics}
                        active
                        title={{ width: "25%" }}
                    >
                      Ӿ {statistics?.totalShopRevenues}
                    </Skeleton>
                  </Col>
                </Row>

                <Divider/>
                <Title level={4} >{t("pages.raiblocksmc.statsDividers.pvp")}
                  <Tooltip placement="right"
                           title={t("pages.raiblocksmc.tooltips.pvp") + ` Ӿ ${statistics?.pvpWorldJoinBet}`}>
                    <QuestionCircle />
                  </Tooltip>
                </Title>
                <Row gutter={6}>
                  <Col xs={24} sm={6}>
                    {t("pages.raiblocksmc.playersInPvpWorld")}
                  </Col>
                  <Col xs={24} sm={18}>
                    <Skeleton
                        paragraph={false}
                        loading={!statistics}
                        active
                        title={{ width: "25%" }}
                    >
                      {statistics?.playersInPvpWorld?.join(", ")}
                    </Skeleton>
                  </Col>
                </Row>
                <Row gutter={6}>
                  <Col xs={24} sm={6}>
                    {t("pages.raiblocksmc.pvpWorldPlayerBounty")}
                  </Col>
                  <Col xs={24} sm={18}>
                    <Skeleton
                        paragraph={false}
                        loading={!statistics}
                        active
                        title={{ width: "25%" }}
                    >
                      {statistics?.pvpWorldPlayerBounty}
                    </Skeleton>
                  </Col>
                </Row>
                <Row gutter={6}>
                  <Col xs={24} sm={6}>
                    {t("pages.raiblocksmc.pvpWorldPlayerBountyAmount")}
                  </Col>
                  <Col xs={24} sm={18}>
                    <Skeleton
                        paragraph={false}
                        loading={!statistics}
                        active
                        title={{ width: "25%" }}
                    >
                      Ӿ {statistics?.pvpWorldPlayerBountyAmount}
                    </Skeleton>
                  </Col>
                </Row>
                <Row gutter={6}>
                  <Col xs={24} sm={6}>
                    {t("pages.raiblocksmc.pvpWorldTotalPayout")}
                  </Col>
                  <Col xs={24} sm={18}>
                    <Skeleton
                        paragraph={false}
                        loading={!statistics}
                        active
                        title={{ width: "25%" }}
                    >
                      Ӿ {statistics?.pvpWorldTotalPayout}
                    </Skeleton>
                  </Col>
                </Row>

                <Divider/>
                <Title level={4} >{t("pages.raiblocksmc.statsDividers.referral")}
                  <Tooltip placement="right"
                           title={t("pages.raiblocksmc.tooltips.referral") + ` Ӿ ${statistics?.referralJoiningReward}`}>
                    <QuestionCircle />
                  </Tooltip>
                </Title>
                <Row gutter={6}>
                  <Col xs={24} sm={6}>
                    {t("pages.raiblocksmc.playerReferralsCount")}
                  </Col>
                  <Col xs={24} sm={18}>
                    <Skeleton
                        paragraph={false}
                        loading={!statistics}
                        active
                        title={{ width: "25%" }}
                    >
                      {statistics?.playerReferralsCount}
                    </Skeleton>
                  </Col>
                </Row>
                <Row gutter={6}>
                  <Col xs={24} sm={6}>
                    {t("pages.raiblocksmc.totalReferralsPayout")}
                  </Col>
                  <Col xs={24} sm={18}>
                    <Skeleton
                        paragraph={false}
                        loading={!statistics}
                        active
                        title={{ width: "25%" }}
                    >
                      Ӿ {statistics?.totalReferralsPayout}
                    </Skeleton>
                  </Col>
                </Row>

              </Card>
          }
        </Col>

        {Object.keys(statistics).length !== 0 &&
            <Col xs={24} md={12}>
              <Title level={3}>{t("pages.raiblocksmc.leaderboards")}</Title>
              <Card size="small" bordered={false} className="detail-layout">
                <Tabs defaultActiveKey="1" tabBarStyle={{color: theme === Theme.DARK ? "#fff" : "#1e1e1e"}}>
                  <Tabs.TabPane tab={t("pages.raiblocksmc.leaderboardTabs.treasureHunt")} key="1">
                    <TreasureHuntLeaderboard treasureHuntLeaderboard={leaderboards.treasureHunt} />
                  </Tabs.TabPane>
                  <Tabs.TabPane tab={t("pages.raiblocksmc.leaderboardTabs.market")} key="2">
                    <MarketLeaderboard marketLeaderboard={leaderboards.shops} />
                  </Tabs.TabPane>
                  <Tabs.TabPane tab={t("pages.raiblocksmc.leaderboardTabs.pvp")} key="3">
                    <PvpLeaderboard pvpLeaderboard={leaderboards.pvp} />
                  </Tabs.TabPane>
                  <Tabs.TabPane tab={t("pages.raiblocksmc.leaderboardTabs.referral")} key="4">
                    <ReferralLeaderboard referralLeaderboard={leaderboards.referral} />
                  </Tabs.TabPane>
                </Tabs>
              </Card>
            </Col>
        }

      </Row>
    </>
  );
};

export default RaiblocksMCPage;
