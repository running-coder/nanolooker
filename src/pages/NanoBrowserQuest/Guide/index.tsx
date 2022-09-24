import * as React from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { Card, Row, Col, Tooltip, Typography } from "antd";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import guide from "./guide.md";
import { getItemAttributes } from "./utils";

import "./guide.css";

const { Title } = Typography;

const NanoBrowserQuestGuidePage: React.FC = () => {
  const { t } = useTranslation();

  const [markdown, setMarkdown] = React.useState("");

  React.useEffect(() => {
    fetch(guide)
      .then(response => response.text())
      .then(text => {
        setMarkdown(text);
      });
  }, []);

  return (
    <>
      <Helmet>
        <title>{t("pages.nanobrowserquest.guide.title")}</title>
      </Helmet>
      <Row gutter={[12, 0]}>
        <Col xs={24}>
          <Title level={3}>
            NanoBrowserQuest Guide{" "}
            <span
              className="color-muted"
              style={{
                fontSize: "12px",
              }}
            >
              {t("common.by")} oldschooler &amp; running-coder
            </span>
          </Title>
          <Card size="small" bordered={false} className="guide">
            <Row gutter={[12, 0]}>
              <Col xs={24}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    //@ts-ignore
                    img: Image,
                  }}
                >
                  {markdown}
                </ReactMarkdown>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </>
  );
};

const Image: React.FC<HTMLImageElement> = ({ src, alt: rawAttributes }) => {
  let title;
  if (rawAttributes?.startsWith("{")) {
    title = getItemAttributes(JSON.parse(rawAttributes));

    return (
      <Tooltip
        placement="right"
        title={title}
        overlayClassName="tooltip-nbq-item"
      >
        <div
          className="item-container"
          style={{
            position: "relative",
            backgroundImage: `url(${src}) `,
          }}
        />
      </Tooltip>
    );
  } else {
    return (
      <div style={{ padding: "6px" }}>
        <img src={src} alt={rawAttributes} />
      </div>
    );
  }
};

export default NanoBrowserQuestGuidePage;
