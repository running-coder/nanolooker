import React from "react";
import { Link } from "react-router-dom";
import { Col, Layout, Menu, Row } from "antd";
import {
  ApartmentOutlined,
  CalendarOutlined,
  DatabaseOutlined
} from "@ant-design/icons";
import Search from "components/Search";
import Price from "components/Price";
import Preferences from "components/Preferences";

const { SubMenu } = Menu;
const { Header } = Layout;

const AppHeader: React.FC = () => (
  <>
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
            display: "flex",
            alignItems: "center",
            minHeight: "50px"
          }}
        >
          <Link to="/" style={{ whiteSpace: "nowrap", marginRight: "10px" }}>
            Nano Looker
          </Link>
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
                Representatives
                <Link to="/representatives" />
              </Menu.Item>
              <Menu.Item key="developer-fund">
                DeveloperFund
                <Link to="/developer-fund" />
              </Menu.Item>
              <Menu.Item key="known-accounts">
                Known Accounts
                <Link to="/known-accounts" />
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
            <Menu.Item key="node-status">
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
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        background: "#fff",
        padding: "3px 20px",
        borderTop: "solid 1px #f0f0f0"
      }}
    >
      <div
        className="price-list"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          width: "100%",
          marginRight: "12px"
        }}
      >
        <Price />
      </div>
      <div>
        <Preferences />
        {/* <Switch
            checkedChildren={<BulbOutlined />}
            unCheckedChildren={<CloseOutlined />}
            onChange={(checked: boolean) => {
              setIsDarkTheme(!checked);
            }}
            defaultChecked
          /> */}
      </div>
      {/* // */}
      {/* <BulbOutlined />  */}
    </div>
  </>
);

export default AppHeader;
