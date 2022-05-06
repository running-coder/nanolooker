import * as React from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Card, Row, Col, Skeleton, Space, Typography } from "antd";
import useNanoBrowserQuestPlayers from "./hooks/use-nanobrowserquest-players";
import Register from "./Register";
import Leaderboard from "./Leaderboard";
import HowToPlay from "./HowToPlay";
import Guide from "./Guide";

import type { PageParams } from "types/page";

export enum Sections {
  INDEX = "",
  GUIDE = "guide",
}

const { Text, Title } = Typography;

const NanoBrowserQuestPage: React.FC = () => {
  const { t } = useTranslation();
  const { playerCount } = useNanoBrowserQuestPlayers();
  const { section = Sections.INDEX } = useParams<PageParams>();

  return section === Sections.INDEX ? (
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
                    maxWidth: "600px",
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
        </Col>
        <Col xs={24} md={12}>
          <Leaderboard />
        </Col>
      </Row>
    </>
  ) : (
    <Guide />
  );
};

export default NanoBrowserQuestPage;
