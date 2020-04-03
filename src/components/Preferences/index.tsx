import React from "react";
import { List, Popover } from "antd";

import {
  // SettingOutlined
  ControlOutlined
} from "@ant-design/icons";

import ThemePreferences from "./Theme";
import CryptocurrencyPreferences from "./Cryptocurrency";
import FiatPreferences from "./Fiat";

const Preferences: React.FC = () => {
  return (
    <>
      <Popover
        placement="bottomRight"
        content={
          <List size="small">
            <List.Item>
              <ThemePreferences />
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
        <ControlOutlined style={{ fontSize: "16px" }} />
      </Popover>
    </>
  );
};

export default Preferences;
