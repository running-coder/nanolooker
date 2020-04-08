import React from "react";
import { List, Popover } from "antd";

import {
  SettingOutlined,
  // ControlOutlined
} from "@ant-design/icons";
import { Theme, PreferencesContext } from "api/contexts/Preferences";
import ThemePreferences from "./Theme";
import CryptocurrencyPreferences from "./Cryptocurrency";
import FiatPreferences from "./Fiat";
import LanguagePreferences from "./Language";

const Preferences: React.FC = () => {
  const { theme } = React.useContext(PreferencesContext);
  console.log("allo", theme === Theme.DARK ? "theme-dark" : "");
  return (
    <>
      <Popover
        style={{ color: "red" }}
        className={theme === Theme.DARK ? "theme-dark" : ""}
        placement="bottomRight"
        content={
          <List size="small">
            <List.Item>
              <ThemePreferences />
            </List.Item>
            <List.Item>
              <LanguagePreferences />
            </List.Item>
            <List.Item>
              <CryptocurrencyPreferences />
            </List.Item>
            <List.Item>
              <FiatPreferences />
            </List.Item>
          </List>
        }
        trigger="click"
      >
        <SettingOutlined />
      </Popover>
    </>
  );
};

export default Preferences;
