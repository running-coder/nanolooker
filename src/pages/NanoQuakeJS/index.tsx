import * as React from "react";
import { useTranslation } from "react-i18next";
import { Card, Row, Col, Skeleton, Space, Typography } from "antd";
import BigNumber from "bignumber.js";
import useNanoQuakeJS from "./hooks/use-nano-quakejs-scores";
import Register from "./Register";
import Scores from "./Scores";

const { Text, Title } = Typography;

const NanoQuakeJSPage: React.FC = () => {
  const { t } = useTranslation();
  const { playerCount } = useNanoQuakeJS();

  return (
    <>
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
                  <Text>PLAYERS ONLINE:</Text>
                  <Skeleton
                    paragraph={false}
                    loading={!playerCount}
                    active
                    title={{ width: "50px" }}
                  >
                    {playerCount}/12
                  </Skeleton>
                </Space>
              </Col>
            </Row>
            <Row>
              <Col xs={24}>
                <img
                  src="/nanoquakejs/quake3arena.svg"
                  alt="Quake 3"
                  width="100%"
                  style={{
                    maxWidth: "320px",
                    display: "block",
                    margin: "-50px auto -30px",
                  }}
                />

                <Title level={4} style={{ textAlign: "center" }}>
                  Jump into the Arena and get paid in NANO for your Frags!
                </Title>

                <p>
                  Welcome to the Arena, where high-ranking warriors are
                  transformed into spineless mush. Abandoning every ounce of
                  common sense and any trace of doubt, you lunge onto a stage of
                  harrowing landscapes and veiled abysses. Your new environment
                  rejects you with lava pits and atmospheric hazards as legions
                  of foes surround you, testing the gut reaction that brought
                  you here in the first place. Your new mantra: fight or be
                  finished.
                </p>
                <p>
                  Play the 1999 best selling first-person shooter game with your
                  friends and other players around the world earning NANO for
                  fragging each other!
                </p>
              </Col>
            </Row>
            <Register />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Title level={3}>Gameplay</Title>
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
          </Card>
        </Col>
      </Row>

      <Row gutter={[12, 0]}>
        <Col xs={{ span: 24, order: 1 }} md={{ span: 12, order: 1 }}>
          <Title level={3}>Game in progress</Title>
          <Card size="small" bordered={false} className="detail-layout">
            {/* <Row gutter={6}>
              <Col xs={24} sm={6}>
                Players Online
              </Col>
              <Col xs={24} sm={18}>
                9/12
              </Col>
            </Row> */}
            <Row gutter={6}>
              <Col xs={24} sm={6}>
                Map
              </Col>
              <Col xs={24} sm={18}>
                Q3DM7: Temple of Retribution
              </Col>
            </Row>
            <Row gutter={6}>
              <Col xs={24} sm={6}>
                Status
              </Col>
              <Col xs={24} sm={18}>
                Match in progress, 10:31
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={{ span: 24, order: 3 }} md={{ span: 12, order: 2 }}>
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
        </Col>
        <Col xs={{ span: 24, order: 2 }} md={{ order: 3 }}>
          <Scores />
        </Col>
      </Row>
    </>
  );
};

export default NanoQuakeJSPage;
