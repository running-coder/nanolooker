import "./guide.css";

import * as React from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";

import { Card, Col, Row, Tooltip, Typography } from "antd";
import remarkGfm from "remark-gfm";

import Header from "./components/Header";

import guide from "./guide.md";
import { getItemAttributes } from "./utils";

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
              {t("common.by")} oldschooler, mika &amp; running-coder
            </span>
          </Title>
          <Card size="small" className="guide">
            <Row gutter={[12, 0]}>
              <Col xs={24}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  renderers={{ heading: Header }}
                  components={{
                    //@ts-ignore
                    img: Image,
                    h1: Header,
                    h2: Header,
                    h3: Header,
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
    try {
      title = getItemAttributes(JSON.parse(rawAttributes));
    } catch (err) {
      // console.log("`~~~rawAttributes", rawAttributes);
      // console.log("`~~~rawAttributes", JSON.parse(rawAttributes));
      // console.log("`~~~title", title);
    }

    const isNbqItemImage = src.includes("item-");
    return (
      <Tooltip placement="right" title={title} overlayClassName="tooltip-nbq-item">
        <div
          className={`${isNbqItemImage ? "item-container" : ""}`}
          style={{
            position: "relative",
            backgroundImage: `url(${src})`,

            ...(!isNbqItemImage ? { width: 24, height: 24 } : null),
          }}
        />
      </Tooltip>
    );
  } else {
    return (
      <div style={{ padding: "6px" }}>
        <img src={src} alt={rawAttributes} style={{ maxWidth: "100%", overflow: "hidden" }} />
      </div>
    );
  }
};

export default NanoBrowserQuestGuidePage;
