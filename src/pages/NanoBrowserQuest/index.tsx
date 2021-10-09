import * as React from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { Card, Row, Col, Skeleton, Space, Typography } from "antd";
import useNanoBrowserQuestPlayers from "./hooks/use-nanobrowserquest-players";
import Register from "./Register";
import Leaderboard from "./Leaderboard";
import HowToPlay from "./HowToPlay";

const { Text, Title } = Typography;

const NanoBrowserQuestPage: React.FC = () => {
  const { t } = useTranslation();
  const { playerCount } = useNanoBrowserQuestPlayers();

  return (
    <>
      <Helmet>
        <title>{t("pages.nanobrowserquest.playNanoBrowserQuest")}</title>
      </Helmet>
      <Row gutter={[12, 0]}>
        <Col xs={24} md={12}>
          <Title level={3}>
            NanoBrowserQuest{" "}
            <span
              className="color-muted"
              style={{
                fontSize: "12px",
              }}
            >
              {t("common.by")} running-coder
            </span>
          </Title>
          <Card size="small" bordered={false} className="detail-layout">
            <Row gutter={[12, 0]}>
              <Col xs={24}>
                <Space size={12}>
                  <Text style={{ textTransform: "uppercase" }}>
                    {t("pages.nanobrowserquest.playersOnline")}:
                  </Text>
                  <Skeleton
                    paragraph={false}
                    loading={!playerCount}
                    active
                    title={{ width: "50px" }}
                  >
                    {playerCount}
                  </Skeleton>
                </Space>
              </Col>
            </Row>
            <Row>
              <Col xs={24}>
                <img
                  src="/nanobrowserquest/nanobrowserquest.jpg"
                  alt="NanoBrowserQuest"
                  width="100%"
                  style={{
                    maxWidth: "400px",
                    display: "block",
                    pointerEvents: "none",
                    margin: "0 auto",
                  }}
                />

                <Text style={{ display: "block", margin: "12px 0" }}>
                  {t("pages.nanobrowserquest.gameDescription")}
                </Text>
              </Col>
            </Row>
            <Register />
          </Card>

          <HowToPlay />

          {/* <Card size="small" bordered={false} className="detail-layout">
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
          </Card> */}
        </Col>
        <Col xs={24} md={12}>
          <Leaderboard />
        </Col>
      </Row>
    </>
  );
};

export default NanoBrowserQuestPage;
