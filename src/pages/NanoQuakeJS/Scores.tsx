import * as React from "react";
// import { useTranslation } from "react-i18next";
import { Card, Row, Col, Space } from "antd";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import data from "./data.json";

const pingColor = (ping: number) => {
  if (ping < 50) return "green";
  if (ping < 100) return "#ffda03";
  if (ping < 200) return "orange";
  return "red";
};

const Scores: React.FC = () => {
//   const { t } = useTranslation();
  const isMediumAndHigher = !useMediaQuery("(max-width: 768px)");

  return (
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
        (
          {
            character,
            score,
            ping,
            time,
            damageGiven,
            damageTaken,
            name,
            awards,
          },
          index,
        ) => (
          <Row gutter={12} key={index}>
            <Col xs={2}>
              <img
                src={`/nanoquakejs/characters/${character}.png`}
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
                {awards.map((award, index) => (
                  <img
                    key={index}
                    src={`/nanoquakejs/award/${award}.png`}
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
  );
};

export default Scores;
