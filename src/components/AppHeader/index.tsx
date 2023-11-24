import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useHistory, useLocation } from "react-router-dom";

import { ApartmentOutlined, CalendarOutlined, DatabaseOutlined } from "@ant-design/icons";
import { Col, Layout, Menu, Row } from "antd";

import Preferences from "components/Preferences";
import Price from "components/Price";
import Search from "components/Search";

const { SubMenu } = Menu;
const { Header } = Layout;

const AppHeader: React.FC = () => {
  const { t } = useTranslation();
  const [activeMenu, setActiveMenu] = React.useState<string>("");
  const history = useHistory();
  const { pathname } = useLocation();

  React.useEffect(() => {
    const key = pathname.replace(/\/?([^/]+)/, "$1");
    setActiveMenu(key);
  }, [pathname]);

  return (
    <>
      <Header
        className="app-header"
        style={{
          paddingTop: "6px",
          position: "relative",
          width: "100%",
          height: "auto",
        }}
      >
        <Row style={{ alignItems: "center" }}>
          <Col
            xs={6}
            md={4}
            order={1}
            style={{
              display: "flex",
              alignItems: "center",
              minHeight: "50px",
            }}
          >
            <Link to="/" style={{ whiteSpace: "nowrap", marginRight: "10px" }}>
              NanoLooker
            </Link>
          </Col>
          <Col xs={{ span: 24, order: 3 }} md={{ span: 12, order: 2 }}>
            <Menu onClick={() => {}} selectedKeys={[activeMenu]} mode="horizontal">
              <SubMenu
                key="explore-submenu"
                title={
                  <span onClick={() => history.push("/")}>
                    <ApartmentOutlined />
                    {t("menu.explore")}
                  </span>
                }
              >
                <Menu.Item key="representatives">
                  {t("menu.representatives")}
                  <Link to="/representatives" />
                </Menu.Item>
                <Menu.Item key="developer-fund">
                  {t("menu.developerFund")}
                  <Link to="/developer-fund" />
                </Menu.Item>
                <Menu.Item key="known-accounts">
                  {t("menu.knownAccounts")}
                  <Link to="/known-accounts" />
                </Menu.Item>
                <Menu.Item key="large-transactions">
                  {t("menu.largeTransactions")}
                  <Link to="/large-transactions" />
                </Menu.Item>
                <Menu.Item key="distribution">
                  {t("menu.distribution")}
                  <Link to="/distribution" />
                </Menu.Item>
                <Menu.Item key="exchange-tracker">
                  {t("menu.exchangeTracker")}
                  <Link to="/exchange-tracker" />
                </Menu.Item>
                <Menu.Item key="faucets">
                  {t("menu.faucets")}
                  <Link to="/faucets" />
                </Menu.Item>
              </SubMenu>

              <Menu.Item key="news">
                <CalendarOutlined />
                {t("menu.news")}
                <Link to="/news" />
              </Menu.Item>

              <SubMenu
                key="status-submenu"
                title={
                  <>
                    <DatabaseOutlined />
                    {t("menu.status")}
                  </>
                }
              >
                <Menu.Item key="node-status">
                  {t("menu.nodeStatus")}
                  <Link to="/node-status" />
                </Menu.Item>
                <Menu.Item key="network-status">
                  {t("menu.networkStatus")}
                  <Link to="/network-status" />
                </Menu.Item>
                <Menu.Item key="node-monitors">
                  {t("menu.nodeMonitors")}
                  <Link to="/node-monitors" />
                </Menu.Item>
              </SubMenu>
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
        className="app-sub-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div
          className="price-list"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            width: "100%",
            marginRight: "12px",
          }}
        >
          <Price />
        </div>
        <div>
          <Preferences />
        </div>
      </div>
    </>
  );
};

export default AppHeader;
