import * as React from "react";
import { useTranslation } from "react-i18next";
import { Card, Col, Row, Typography } from "antd";

import type { YoutubePost } from "./hooks/use-youtube";

const { Title } = Typography;

interface Props {
  post: YoutubePost;
}

const Youtube: React.FC<Props> = ({ post }) => {
  const { t } = useTranslation();
  const [isClicked, setIsClicked] = React.useState(false);

  const {
    videoId,
    title,
    channelTitle,
    pubDate,
    thumbnail = "",
    description,
  } = post;

  return (
    <Row gutter={[12, 0]}>
      <Col xs={24} md={10} lg={8}>
        <Card
          bodyStyle={{
            padding: 0,
            minHeight: !thumbnail ? "180px" : "auto",
          }}
        >
          {!isClicked ? (
            <div style={{ background: "#000", textAlign: "center" }}>
              <img
                src={thumbnail}
                alt={title}
                width="75%"
                onClick={() => setIsClicked(true)}
              />
            </div>
          ) : (
            <div className="video-wrapper">
              <iframe
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title="Quake3"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}
        </Card>
      </Col>
      <Col xs={24} md={14} lg={16}>
        <Card size="small">
          <Title level={4} style={{ marginBottom: 0 }}>
            {title}
          </Title>
          <span
            style={{
              display: "block",
              fontSize: "12px",
              marginBottom: "12px",
            }}
            className="color-muted"
          >
            {pubDate} {t("common.by")} {channelTitle}
          </span>
          <div>{description}</div>
        </Card>
      </Col>
    </Row>
  );
};

export default Youtube;
