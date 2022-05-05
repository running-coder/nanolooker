import * as React from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { Card, Row, Col, Typography } from "antd";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import guide from "./guide.md";

const { Title } = Typography;

const NanoBrowserQuestGuidePage: React.FC = () => {
  const { t } = useTranslation();

  const [markdown, setMarkdown] = React.useState("");

  // useEffect with an empty dependency array (`[]`) runs only once
  React.useEffect(() => {
    fetch(guide)
      .then(response => response.text())
      .then(text => {
        // Logs a string of Markdown content.
        // Now you could use e.g. <rexxars/react-markdown> to render it.
        // console.log(text);
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
            BananoBrowserQuest Guide{" "}
            <span
              className="color-muted"
              style={{
                fontSize: "12px",
              }}
            >
              {t("common.by")} oldschooler &amp; running-coder
            </span>
          </Title>
          <Card size="small" bordered={false} className="detail-layout guide">
            <Row gutter={[12, 0]}>
              <Col xs={24}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
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

export default NanoBrowserQuestGuidePage;
