import React from "react";
import { Route, Switch, Link } from "react-router-dom";
import { Col, Layout, Menu, Row } from "antd";
import {
  ApartmentOutlined,
  CalendarOutlined,
  DatabaseOutlined,
  GithubOutlined
} from "@ant-design/icons";

import HomePage from "pages/Home";
import Representatives from "pages/Representatives";
import DeveloperFund from "pages/DeveloperFund";
import DeveloperFundTransactions from "pages/DeveloperFund/Transactions";
import Distribution from "pages/Distribution";
import AccountPage from "pages/Account";
import BlockPage from "pages/Block";
import NewsPage from "pages/News";
import StatusPage from "pages/Status";

import Search from "components/Search";
import Price from "components/Price";

import "./App.css";
import "antd/dist/antd.css";

const { Header, Content, Footer } = Layout;
const { SubMenu } = Menu;

const App: React.FunctionComponent = props => (
  <Layout style={{ minHeight: "100vh" }}>
    <Header
      style={{
        position: "relative",
        backgroundColor: "white",
        padding: "0 20px",
        width: "100%",
        height: "auto"
      }}
    >
      <Row gutter={[16, 0]} style={{ width: "100%" }}>
        <Col
          xs={{ span: 6 }}
          md={{ span: 4 }}
          order={1}
          style={{
            paddingTop: "6px",
            paddingBottom: "6px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <Link to="/" style={{ whiteSpace: "nowrap", marginRight: "10px" }}>
            Nano Looker
          </Link>

          <Price />
        </Col>

        <Col xs={{ span: 24, order: 3 }} md={{ span: 12, order: 2 }}>
          <Menu onClick={() => {}} selectedKeys={[]} mode="horizontal">
            <SubMenu
              title={
                <Link to="/">
                  <ApartmentOutlined />
                  Explore
                </Link>
              }
            >
              <Menu.Item key="representatives">
                Principal Representatives
                <Link to="/representatives" />
              </Menu.Item>
              <Menu.Item key="developer-fund">
                DeveloperFund
                <Link to="/developer-fund" />
              </Menu.Item>
              <Menu.Item key="distribution">
                Distribution
                <Link to="/distribution" />
              </Menu.Item>
            </SubMenu>
            <Menu.Item key="news">
              <CalendarOutlined />
              News
              <Link to="/news" />
            </Menu.Item>
            <Menu.Item key="representatives">
              <DatabaseOutlined />
              Node Status
              <Link to="/status" />
            </Menu.Item>
          </Menu>
        </Col>

        <Col
          xs={{ span: 18, order: 2 }}
          md={{ span: 8, order: 3 }}
          style={{ textAlign: "right" }}
        >
          <Search />
        </Col>
      </Row>
    </Header>
    <Content style={{ padding: "20px" }}>
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route path="/representatives" component={Representatives} />
        <Route exact path="/developer-fund" component={DeveloperFund} />
        <Route
          path="/developer-fund/transactions"
          component={DeveloperFundTransactions}
        />
        <Route path="/distribution" component={Distribution} />
        <Route path="/account/:account?" component={AccountPage} />
        <Route path="/block/:block?" component={BlockPage} />
        <Route path="/news" component={NewsPage} />
        <Route path="/status" component={StatusPage} />
      </Switch>
    </Content>
    <Footer style={{ textAlign: "center" }}>
      <a
        href="https://github.com/running-coder/nanolooker"
        rel="noopener noreferrer"
        target="_blank"
      >
        <GithubOutlined /> Nano Looker
      </a>{" "}
      ©2020 Created by RunningCoder
    </Footer>
  </Layout>
);

export default App;
