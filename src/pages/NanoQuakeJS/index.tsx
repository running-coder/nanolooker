import * as React from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Card, Row, Col, Skeleton, Space, Typography } from "antd";
import { Natricon } from "components/Preferences/Natricons/Natricon";
import BigNumber from "bignumber.js";
import useNanoQuakeJS from "./hooks/use-nanoquakejs-scores";
import { PreferencesContext } from "api/contexts/Preferences";
import Register from "./Register";
import Leaderboard from "./Leaderboard";

const { Text, Title } = Typography;

const NanoQuakeJSPage: React.FC = () => {
  const { t } = useTranslation();
  const { playerCount, statistics, currentMap, topScores } = useNanoQuakeJS();
  const { nanoQuakeJSUsername, nanoQuakeJSAccount } = React.useContext(
    PreferencesContext,
  );

  const playerRank = topScores.find(
    ({ player }) => player === nanoQuakeJSUsername,
  )?.rank;

  return (
    <>
      <Helmet>
        <title>{t("pages.nanoquakejs.playNanoquakejs")}</title>
      </Helmet>
      <Row gutter={[12, 0]}>
        <Col xs={24} md={12}>
          <Title level={3}>
            NanoQuakeJS{" "}
            <span
              className="color-muted"
              style={{
                fontSize: "12px",
              }}
            >
              {t("common.by")} Jayycox
            </span>
          </Title>
          <Card size="small" bordered={false} className="detail-layout">
            <Row gutter={[12, 0]}>
              <Col xs={24}>
                <Space size={12}>
                  <Text style={{ textTransform: "uppercase" }}>
                    {t("pages.nanoquakejs.playersOnline")}:
                  </Text>
                  <Skeleton
                    paragraph={false}
                    loading={!playerCount}
                    active
                    title={{ width: "50px" }}
                  >
                    {playerCount}/14
                  </Skeleton>
                </Space>
              </Col>
            </Row>
            {nanoQuakeJSUsername && nanoQuakeJSAccount ? (
              <>
                <Row gutter={6}>
                  <Col xs={24}>
                    <Space size={12}>
                      <Natricon
                        account={nanoQuakeJSAccount}
                        style={{
                          margin: "-12px -12px -18px -12px ",
                          width: "80px",
                          height: "80px",
                        }}
                      />
                      <div>
                        <div className="color-important default-color">
                          {nanoQuakeJSUsername}{" "}
                          <span
                            style={{ fontWeight: "normal" }}
                            className="color-muted"
                          >
                            {playerRank ? `#${playerRank}` : null}
                          </span>
                        </div>
                        <Link
                          to={`/account/${nanoQuakeJSAccount}`}
                          className="break-word"
                        >
                          {nanoQuakeJSAccount}
                        </Link>
                      </div>
                    </Space>
                  </Col>
                </Row>
              </>
            ) : null}
            <Row>
              <Col xs={24}>
                <img
                  src="/nanoquakejs/quake3arena.svg"
                  alt="Quake 3"
                  width="100%"
                  style={{
                    maxWidth: "320px",
                    display: "block",
                    margin: "-50px auto -50px",
                  }}
                />

                <Title
                  level={5}
                  style={{ textAlign: "center", marginBottom: "24px" }}
                >
                  {t("pages.nanoquakejs.welcomeTitle")}
                </Title>
              </Col>
            </Row>
            <Register />
          </Card>
          <Card size="small" bordered={false} className="detail-layout">
            <Row gutter={6}>
              <Col xs={24} sm={6}>
                {t("pages.nanoquakejs.currentMap")}
              </Col>
              <Col xs={24} sm={18}>
                <Skeleton
                  paragraph={false}
                  loading={!currentMap}
                  active
                  title={{ width: "50%" }}
                >
                  {currentMap}
                </Skeleton>
              </Col>
            </Row>
            <Row gutter={6}>
              <Col xs={24} sm={6}>
                {t("pages.nanoquakejs.totalFrags")}
              </Col>
              <Col xs={24} sm={18}>
                <Skeleton
                  paragraph={false}
                  loading={!statistics?.totalFrags}
                  active
                  title={{ width: "25%" }}
                >
                  {new BigNumber(statistics?.totalFrags).toFormat()}
                </Skeleton>
              </Col>
            </Row>
            <Row gutter={6}>
              <Col xs={24} sm={6}>
                {t("pages.nanoquakejs.gamesPlayed")}
              </Col>
              <Col xs={24} sm={18}>
                <Skeleton
                  paragraph={false}
                  loading={!statistics?.gamesPlayed}
                  active
                  title={{ width: "25%" }}
                >
                  {new BigNumber(statistics?.gamesPlayed).toFormat()}
                </Skeleton>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Leaderboard topScores={topScores} />
        </Col>
      </Row>

      <Row gutter={[12, 0]}>
        <Col xs={24} md={12}>
          <Title level={3}>{t("pages.nanoquakejs.trailer")}</Title>
          <Card size="small" bordered={false} className="detail-layout">
            <div className="video-wrapper">
              <iframe
                width="560"
                height="315"
                src="https://www.youtube-nocookie.com/embed/quvLQq_d__E"
                title="Quake3"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            <p style={{ marginTop: 12 }}>
              {t("pages.nanoquakejs.welcomeDescription")}
            </p>

            <p>{t("pages.nanoquakejs.welcomeDescription2")}</p>
          </Card>
        </Col>
        {/* <Col xs={{ span: 24, order: 3 }} md={{ span: 12, order: 2 }}>
          <Title level={3}>Statistics</Title>
          <Card size="small" bordered={false} className="detail-layout">
            <Row gutter={6}>
              <Col xs={24} sm={8}>
                Registered Players
              </Col>
              <Col xs={24} sm={16}>
                {new BigNumber(4143).toFormat()}
              </Col>
            </Row>
            <Row gutter={6}>
              <Col xs={24} sm={8}>
                Total Frags
              </Col>
              <Col xs={24} sm={16}>
                {new BigNumber(490334).toFormat()}
              </Col>
            </Row>
            <Row gutter={6}>
              <Col xs={24} sm={8}>
                Season payouts
              </Col>
              <Col xs={24} sm={16}>
                {new BigNumber(2.123456).toFormat()} NANO
              </Col>
            </Row>
            <Row gutter={6}>
              <Col xs={24} sm={8}>
                Total paid out
              </Col>
              <Col xs={24} sm={16}>
                {new BigNumber(215.55).toFormat()} NANO
              </Col>
            </Row>
            <Row gutter={6}>
              <Col xs={24} sm={8}>
                Last game
              </Col>
              <Col xs={24} sm={16}>
                {new BigNumber(0.0023456).toFormat()} NANO
              </Col>
            </Row>
          </Card>
        </Col> */}
        {/* <Col xs={{ span: 24, order: 2 }} md={{ order: 3 }}>
          <Scores />
        </Col> */}
      </Row>
    </>
  );
};

export default NanoQuakeJSPage;
