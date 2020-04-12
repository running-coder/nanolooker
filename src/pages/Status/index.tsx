import React from "react";
import { Row, Col } from "antd";
import BlockCount from "components/BlockCount";
import ActiveDifficulty from "components/ActiveDifficulty";
import Node from "components/Node";
import Ledger from "components/Ledger";

const StatusPage = () => {
  return (
    <Row gutter={[{ xs: 6, sm: 12, md: 12, lg: 12 }, 12]}>
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
    </Row>
  );
};

export default StatusPage;
