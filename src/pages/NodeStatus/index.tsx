import * as React from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { Row, Col, Typography } from "antd";
import BlockCount from "components/BlockCount";
import ActiveDifficulty from "components/ActiveDifficulty";
import Node from "components/Node";
import Ledger from "components/Ledger";
import Peers from "components/Peers";

const { Title } = Typography;

const NodeStatusPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>BananoLooker {t("menu.nodeStatus")}</title>
      </Helmet>
      <Title level={3}>{t("menu.nodeStatus")}</Title>
      <Row gutter={[12, 0]}>
        <Col xs={24} sm={12} lg={8}>
          <BlockCount />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Ledger />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <ActiveDifficulty />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Node />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Peers />
        </Col>
      </Row>
    </>
  );
};

export default NodeStatusPage;
