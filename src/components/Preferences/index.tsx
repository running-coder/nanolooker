import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Card, Col, Popover, Row } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import { Theme, PreferencesContext } from "api/contexts/Preferences";
import ThemePreferences from "./Theme";
import CryptocurrencyPreferences from "./Cryptocurrency";
import FiatPreferences from "./Fiat";
import LanguagePreferences from "./Language";

const Preferences: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = React.useContext(PreferencesContext);
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <Popover
      className={theme === Theme.DARK ? "theme-dark" : ""}
      placement="bottomRight"
      content={
        <Card
          size="small"
          bordered={false}
          style={{ maxWidth: 340 }}
          className="detail-layout"
        >
          <ThemePreferences />
          <LanguagePreferences />
          <CryptocurrencyPreferences />
          <FiatPreferences />
          <Row>
            <Col xs={24} style={{ textAlign: "right" }}>
              <Link to="/preferences" onClick={() => setIsOpen(false)}>
                {t("preferences.viewAll")}
              </Link>
            </Col>
          </Row>
          <Row>
            <Col xs={24} style={{ textAlign: "right" }}>
              <Link to="/bookmarks" onClick={() => setIsOpen(false)}>
                {t("pages.bookmarks.viewAll")}
              </Link>
            </Col>
          </Row>
        </Card>
      }
      trigger="click"
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <SettingOutlined />
    </Popover>
  );
};

export default Preferences;
