import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Col, Layout, Menu, Row } from "antd";
import {
  ApartmentOutlined,
  CalendarOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import { useHistory, useLocation } from "react-router-dom";
import Search from "components/Search";
import Price from "components/Price";
import Preferences from "components/Preferences";

const { SubMenu } = Menu;
const { Header } = Layout;

const AppHeader: React.FC = () => {
  const [activeMenu, setActiveMenu] = React.useState<string>("");
  const history = useHistory();
  const { pathname } = useLocation();
  const { t } = useTranslation();

  React.useEffect(() => {
    const key = pathname.replace(/\/?([^/]+)/, "$1");
    setActiveMenu(key);
  }, [pathname]);

  return (
    <>
      <Header
        className="app-header"
        style={{
          position: "relative",
          width: "100%",
          height: "auto",
        }}
      >
        <Row gutter={[20, 0]} style={{ width: "100%" }}>
          <Col
            xs={{ span: 6 }}
            md={{ span: 4 }}
            order={1}
            style={{
              display: "flex",
              alignItems: "center",
              minHeight: "50px",
            }}
          >
            <Link to="/" style={{ whiteSpace: "nowrap", marginRight: "10px" }}>
              Nano Looker
            </Link>
          </Col>

          <Col xs={{ span: 24, order: 3 }} md={{ span: 12, order: 2 }}>
            <Menu
              onClick={() => {}}
              selectedKeys={[activeMenu]}
              mode="horizontal"
            >
              <SubMenu
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
              <Menu.Item key="status">
                <DatabaseOutlined />
                {t("menu.nodeStatus")}
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
