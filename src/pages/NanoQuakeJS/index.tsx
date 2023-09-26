import * as React from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Card, Col, Row, Skeleton, Space, Typography } from "antd";
import BigNumber from "bignumber.js";

import { PreferencesContext } from "api/contexts/Preferences";
import { Natricon } from "components/Preferences/Natricons/Natricon";

import useNanoQuakeJS from "./hooks/use-nanoquakejs-scores";
import Leaderboard from "./Leaderboard";
import Register from "./Register";

const { Text, Title } = Typography;

const NanoQuakeJSPage: React.FC = () => {
  const { t } = useTranslation();
  const { playerCount, statistics, currentMap, topScores } = useNanoQuakeJS();
  const { nanoQuakeJSUsername, nanoQuakeJSAccount } = React.useContext(PreferencesContext);

  const playerRank = topScores.find(({ player }) => player === nanoQuakeJSUsername)?.rank;

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
          <Card size="small" className="detail-layout">
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
                          <span style={{ fontWeight: "normal" }} className="color-muted">
                            {playerRank ? `#${playerRank}` : null}
                          </span>
                        </div>
                        <Link to={`/account/${nanoQuakeJSAccount}`} className="break-word">
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
                    pointerEvents: "none",
                    margin: "-50px auto -50px",
                  }}
                />

                <Title level={5} style={{ textAlign: "center", marginBottom: "24px" }}>
                  {t("pages.nanoquakejs.welcomeTitle")}
                </Title>
              </Col>
            </Row>
            <Register />
          </Card>
          <Card size="small" className="detail-layout">
            <Row gutter={6}>
              <Col xs={24} sm={6}>
                {t("pages.nanoquakejs.currentMap")}
              </Col>
              <Col xs={24} sm={18}>
                <Skeleton paragraph={false} loading={!currentMap} active title={{ width: "50%" }}>
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
          <Card size="small" className="detail-layout">
            <div className="video-wrapper">
              <iframe
                width="560"
                height="315"
                src="https://www.youtube.com/embed/M3uaZh7DXUc?si=z2qBQtGHsJdl8R0A"
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen
              ></iframe>
            </div>

            <p>{t("pages.nanoquakejs.welcomeDescription2")}</p>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default NanoQuakeJSPage;
