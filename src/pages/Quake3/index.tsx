import React from "react";
// import { useTranslation } from "react-i18next";
import { Button, Card, Row, Col, Space, Typography } from "antd";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import data from "./data.json";

const { Title } = Typography;

const pingColor = (ping: number) => {
  if (ping < 50) return "green";
  if (ping < 100) return "#ffda03";
  if (ping < 200) return "orange";
  return "red";
};

const Quake3Page: React.FC = () => {
  // const { t } = useTranslation();
  const isMediumAndHigher = !useMediaQuery("(max-width: 768px)");

  return (
    <>
      <Title level={3}>
        Earn NANO playing Quake 3 with free to play{" "}
        <a
          href="https://nanoquakejs.com/"
          rel="noopener noreferrer"
          target="_blank"
        >
          NanoQuakeJS
        </a>
      </Title>

      <Row gutter={[{ xs: 6, sm: 12, md: 12, lg: 12 }, 12]}>
        <Col xs={24} md={12}>
          <Card size="small" bordered={false} className="detail-layout">
            <Row gutter={6}>
              <Col xs={24} sm={6}>
                Players
              </Col>
              <Col xs={24} sm={18}>
                6/8
              </Col>
            </Row>
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
            <Row gutter={6}>
              <Col xs={24} sm={6}>
                Spectators
              </Col>
              <Col xs={24} sm={18}>
                4
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card size="small" bordered={false} className="detail-layout">
            <Row gutter={6}>
              <Col xs={24} sm={8}>
                Season 2 payouts
              </Col>
              <Col xs={24} sm={1}>
                2.123456 NANO
              </Col>
            </Row>
            <Row gutter={6}>
              <Col xs={24} sm={8}>
                Last game
              </Col>
              <Col xs={24} sm={16}>
                0.0024153 NANO
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Card
        size="small"
        bordered={false}
        className="detail-layout quake3-scoreboard"
      >
        <Row gutter={12}>
          <Col xs={2}></Col>
          <Col xs={3}>Score</Col>
          <Col xs={3}>Ping</Col>
          {isMediumAndHigher ? (
            <>
              <Col md={2}>Time</Col>
              <Col md={2}>DGiven</Col>
              <Col md={2}>DTaken</Col>
            </>
          ) : null}
          <Col xs={16} md={10}>
            Player
          </Col>
        </Row>
        {data.map(
          ({
            character,
            score,
            ping,
            time,
            damageGiven,
            damageTaken,
            name,
            awards,
          }) => (
            <Row gutter={12}>
              <Col xs={2}>
                <img
                  src={`/quake3/characters/${character}.png`}
                  width="24px"
                  height="24px"
                  alt="sarge"
                />
              </Col>
              <Col xs={3}>{score}</Col>
              <Col
                md={3}
                style={{
                  color: pingColor(ping),
                }}
              >
                {ping}
              </Col>
              {isMediumAndHigher ? (
                <>
                  <Col md={2}>{time}</Col>
                  <Col md={2}>{damageGiven}</Col>
                  <Col md={2}>{damageTaken}</Col>
                </>
              ) : null}
              <Col xs={16} md={10}>
                <Space>
                  {name}
                  {awards.map(award => (
                    <img
                      src={`/quake3/award/${award}.png`}
                      width="24px"
                      height="24px"
                      alt={award}
                    />
                  ))}
                </Space>
              </Col>
            </Row>
          ),
        )}
      </Card>

      <div style={{ marginTop: 12, textAlign: "center" }}>
        <Button
          type="primary"
          href="https://nanoquakejs.com/"
          target="_blank"
          rel="noopener noreferrer"
          size="large"
        >
          Join the action now !
        </Button>
      </div>
    </>
  );
};

export default Quake3Page;
