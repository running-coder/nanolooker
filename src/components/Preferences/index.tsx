import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { SettingOutlined } from "@ant-design/icons";
import { Col, Popover, Row } from "antd";

import { PreferencesContext, Theme } from "api/contexts/Preferences";

import CryptocurrencyPreferences from "./Cryptocurrency";
import FiatPreferences from "./Fiat";
import LanguagePreferences from "./Language";
import ThemePreferences from "./Theme";

const Preferences: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = React.useContext(PreferencesContext);
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <Popover
      placement="bottomRight"
      content={
        <div
          style={{ maxWidth: 340 }}
          className={`detail-layout ${theme === Theme.DARK ? "theme-dark" : ""}`}
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
        </div>
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
