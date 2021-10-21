import * as React from "react";
import { useTranslation } from "react-i18next";
import { Card, Col, Row, Typography } from "antd";

import type { MediumPost } from "./hooks/use-medium";

const { Title } = Typography;

interface Props {
  post: MediumPost;
}

const Medium: React.FC<Props> = ({ post }) => {
  const { t } = useTranslation();

  const {
    title,
    pubDate,
    author,
    link,
    thumbnail = "",
    descriptionShort,
    descriptionLong,
  } = post;
  const hasThumbnail =
    /.+?\.(jpe?g|png|gif)$/.test(thumbnail) ||
    thumbnail.startsWith("https://cdn-images");

  return (
    <Row gutter={[12, 0]}>
      <Col xs={24} md={10} lg={8}>
        <Card
          bodyStyle={{
            padding: 0,
            minHeight: !hasThumbnail ? "180px" : "auto",
          }}
        >
          {hasThumbnail ? (
            <a href={link} target="_blank" rel="noopener noreferrer">
              <img src={thumbnail} alt={title} width="100%" />
            </a>
          ) : null}
          {!hasThumbnail ? (
            <img alt="Nano news" src="/nano-background.png" width="100%" />
          ) : null}
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
            {pubDate} {t("common.by")} {author}
          </span>
          <div dangerouslySetInnerHTML={{ __html: descriptionShort }}></div>
          <div dangerouslySetInnerHTML={{ __html: descriptionLong }}></div>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginTop: "12px", display: "inline-block" }}
          >
            {t("common.continueReading")}
          </a>
        </Card>
      </Col>
    </Row>
  );
};

export default Medium;
