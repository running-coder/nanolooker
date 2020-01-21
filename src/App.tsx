import React from "react";
import { useParams, useLocation, useRouteMatch } from "react-router";
import { Route, Switch, Link } from "react-router-dom";
import { Icon, Input, Layout, Menu, Typography } from "antd";

import HomePage from "pages/Home";
import StatisticsPage from "pages/Statistics";
import StatusPage from "pages/Status";

import "./App.css";
import "antd/dist/antd.css";

const { Title } = Typography;
const { Header, Content, Footer } = Layout;
const { Search } = Input;
//
const App: React.FC = props => {
  // const { match, location, history } = useRouter();

  console.log(useParams());
  console.log(useLocation());
  console.log(useRouteMatch());

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "white"
        }}
      >
        <Link to="/">
          <Title level={2} style={{ margin: 0 }}>
            Nano Looker
          </Title>
        </Link>

        <Menu onClick={() => {}} selectedKeys={[]} mode="horizontal">
          <Menu.Item key="statistics">
            <Icon type="line-chart" />
            Statistics
            <Link to="/statistics" />
          </Menu.Item>

          <Menu.Item key="status">
            <Icon type="database" />
            Node Status
            <Link to="/status" />
          </Menu.Item>
        </Menu>

        <Search
          style={{ maxWidth: "400px" }}
          size="large"
          placeholder="Search by Address / Txhash / Block"
          onSearch={value => console.log(value)}
          enterButton
        />
      </Header>
      <Content style={{ padding: "20px" }}>
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route path="/statistics" component={StatisticsPage} />
          <Route path="/status" component={StatusPage} />
        </Switch>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        <a
          href="https://github.com/running-coder/nanolooker"
          rel="noopener noreferrer"
          target="_blank"
        >
          <Icon type="github" /> Nano Looker
        </a>{" "}
        ©2020 Created by RunningCoder
      </Footer>
    </Layout>
  );
};

export default App;
