import React from "react";
import { Card, Popover } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import { Theme, PreferencesContext } from "api/contexts/Preferences";
import ThemePreferences from "./Theme";
import CryptocurrencyPreferences from "./Cryptocurrency";
import FiatPreferences from "./Fiat";
import LanguagePreferences from "./Language";

const Preferences: React.FC = () => {
  const { theme } = React.useContext(PreferencesContext);
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
        </Card>
      }
      trigger="click"
    >
      <SettingOutlined />
    </Popover>
  );
};

export default Preferences;
