import * as React from "react";
import { useTranslation, Trans } from "react-i18next";
import { Helmet } from "react-helmet";
import { Card, Col, Row, Skeleton, Tooltip, Typography } from "antd";

const { Title, Text } = Typography;

const link = "https://github.com/nanocurrency/nano-node/issues/3264";

const BucketsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>Nano {t("menu.buckets")}</title>
      </Helmet>
      <Title level={3}>{t("menu.buckets")}</Title>

      <Card
        size="small"
        bordered={false}
        className="detail-layout"
        style={{ marginBottom: "12px" }}
      >
        <div style={{ marginBottom: "12px" }}>
          <Trans i18nKey="pages.buckets.description">
            <a href={link} target="_blank" rel="noopener noreferrer">
              {{ link }}
            </a>
          </Trans>
        </div>
      </Card>
    </>
  );
};

export default BucketsPage;
