import * as React from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { Button, Card, Row, Col, Skeleton, Space, Typography } from "antd";
import useRaiblocksMC from "./hooks/use-raiblocksmc";
import Leaderboard from "./Leaderboard";
import { Tracker } from "components/utils/analytics";

const { Text, Title } = Typography;

const RaiblocksMCPage: React.FC = () => {
  const { t } = useTranslation();
  const { statistics } = useRaiblocksMC();

  console.log("~~~~statistics", statistics);

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
                    {t("pages.raiblocksmc.playersOnline")}:
                  </Text>
                  <Skeleton
                    paragraph={false}
                    loading={!statistics}
                    active
                    title={{ width: "50px" }}
                  >
                    {statistics.onlinePlayers || 0}
                  </Skeleton>
                </Space>
              </Col>
            </Row>
            <Row>
              <Col xs={24}>
                <Space size={12} align="center" direction="vertical">
                  <img
                    src="/raiblocksmc/raiblocksmc.png"
                    alt="RaiblocksMC"
                    width="100%"
                    style={{
                      maxWidth: "240px",
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
                </Space>
              </Col>
            </Row>
          </Card>
          <Card size="small" bordered={false} className="detail-layout">
            <Row gutter={6}>
              <Col xs={24} sm={6}>
                {t("pages.raiblocksmc.statistic1")}
              </Col>
              <Col xs={24} sm={18}>
                <Skeleton
                  paragraph={false}
                  loading={!statistics}
                  active
                  title={{ width: "50%" }}
                >
                  {statistics?.statistic1}
                </Skeleton>
              </Col>
            </Row>
            <Row gutter={6}>
              <Col xs={24} sm={6}>
                {t("pages.raiblocksmc.statistic2")}
              </Col>
              <Col xs={24} sm={18}>
                <Skeleton
                  paragraph={false}
                  loading={!statistics}
                  active
                  title={{ width: "25%" }}
                >
                  {statistics?.statistic2}
                </Skeleton>
              </Col>
            </Row>
            <Row gutter={6}>
              <Col xs={24} sm={6}>
                {t("pages.raiblocksmc.statistic3")}
              </Col>
              <Col xs={24} sm={18}>
                <Skeleton
                  paragraph={false}
                  loading={!statistics}
                  active
                  title={{ width: "25%" }}
                >
                  {statistics?.statistic3}
                </Skeleton>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Leaderboard playerScore={statistics.playerScore} />
        </Col>
      </Row>
    </>
  );
};

export default RaiblocksMCPage;
