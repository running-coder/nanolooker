import "./guide.css";

import * as React from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";

import { Card, Col, Row, Tooltip, Typography } from "antd";
import qs from "qs";
import remarkGfm from "remark-gfm";

import Header from "./components/Header";

import guide from "./guide.md";
import { getItemAttributes, getItemClassFromBaseLevel, runeKind } from "./utils";

const { Title } = Typography;

const NanoBrowserQuestGuidePage: React.FC = () => {
  const { t } = useTranslation();

  const [markdown, setMarkdown] = React.useState("");

  React.useEffect(() => {
    fetch(guide)
      .then(response => response.text())
      .then(text => {
        text = text.replace(/:rune([a-z]+):/gi, (match, capturedLetters: string) => {
          //@ts-ignore
          const rune = runeKind[capturedLetters];

          const replacement = `![{"name": "${capturedLetters.toUpperCase()} Rune #${
            rune.rank
          }", "itemClass": "${getItemClassFromBaseLevel(rune.requirement)}", "requirement": "${
            rune.requirement
          }"}](https://nanobrowserquest.com/img/1/item-rune-${capturedLetters}.png)`;
          return replacement;
        });

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
    }

    return (
      <Tooltip placement="right" title={title} overlayClassName="tooltip-nbq-item">
        <div
          className={`item-container ${src.includes("/1/") ? "small" : ""}`}
          style={{
            position: "relative",
            backgroundImage: `url(${src})`,

            // ...(!isNbqItemImage ? { width: 24, height: 24 } : null),
          }}
        />
      </Tooltip>
    );
    // @NOTE non-item* images?
  } else {

    const rawParsedQuery = qs.parse(src.split("?")[1], { ignoreQueryPrefix: true });

    const parsedQuery = Object.assign(rawParsedQuery, { maxWidth: "100%", overflow: "hidden" });

    return (
      <div style={{ padding: "6px", display: "inline-block" }}>
        <img src={src} alt={rawAttributes} style={parsedQuery} />
      </div>
    );
  }
};

export default NanoBrowserQuestGuidePage;
