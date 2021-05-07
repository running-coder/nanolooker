import * as React from "react";
import { useParams } from "react-router-dom";
import { Button, Card, Col, Row, Typography } from "antd";

import Quake3Page from "./Quake3";

import type { PageParams } from "types/page";

const { Title } = Typography;

const earnNanoList = [
  {
    title: "Jump into the Arena and get paid for your Frags!",
    description: (
      <>
        <p>
          Welcome to the Arena, where high-ranking warriors are transformed into
          spineless mush. Abandoning every ounce of common sense and any trace
          of doubt, you lunge onto a stage of harrowing landscapes and veiled
          abysses. Your new environment rejects you with lava pits and
          atmospheric hazards as legions of foes surround you, testing the gut
          reaction that brought you here in the first place. Your new mantra:
          fight or be finished.
        </p>
        <p>
          Play the 1999 best selling first-person shooter game with your friends
          and other players around the world earning NANO for fragging each
          other!
        </p>
        <Button
          type="primary"
          href="https://nanoquakejs.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Join the action !
        </Button>
      </>
    ),
    thumbnail: "/earn-nano/quake3/quake3arena.jpg",
    // link: "/earn-nano/quake3",
    externalLink: "https://nanoquakejs.com/",
  },
];

enum Sections {
  QUAKE3 = "quake3",
}

const EarnNanoPage: React.FC = () => {
  const { section } = useParams<PageParams>();

  return (
    <>
      {section === Sections.QUAKE3 ? <Quake3Page /> : null}
      {!section
        ? earnNanoList.map(
            ({ title, externalLink, thumbnail, description }, index) => (
              <Row gutter={[12, 0]} key={index}>
                <Col xs={24} md={10} lg={8}>
                  <Card
                    bodyStyle={{
                      padding: 0,
                    }}
                  >
                    {/* <Link to={link}> */}
                    <a
                      href={externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img src={thumbnail} alt={title} width="100%" />
                    </a>
                    {/* </Link> */}
                  </Card>
                </Col>
                <Col xs={24} md={14} lg={16}>
                  <Card size="small">
                    <Title level={4} style={{ marginBottom: 0 }}>
                      {title}
                    </Title>
                    {description}
                  </Card>
                </Col>
              </Row>
            ),
          )
        : null}
    </>
  );
};

export default EarnNanoPage;
