import React from "react";
import { Layout, Typography, Row, Col } from "antd";
import BlockCount from "components/BlockCount";
import ActiveDifficulty from "components/ActiveDifficulty";
import Stats from "components/Stats";

import "./App.css";
import "antd/dist/antd.css";

const { Title } = Typography;
const { Header, Content, Footer } = Layout;

const App: React.FC = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ display: "flex", alignItems: "center" }}>
        <Title level={2} style={{ color: "white", margin: 0 }}>
          Nano Looker
        </Title>
      </Header>
      <Content style={{ padding: "50px" }}>
        <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
          <Col xs={24} sm={24} md={12} lg={8} xl={8}>
            <BlockCount />
          </Col>
          <Col xs={24} sm={24} md={12} lg={8} xl={8}>
            <ActiveDifficulty />
          </Col>
          <Col xs={24} sm={24} md={12} lg={8} xl={8}>
            <Stats />
          </Col>
        </Row>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        Nano Looker ©2020 Created by RunningCoder
      </Footer>
    </Layout>
  );
};

export default App;
