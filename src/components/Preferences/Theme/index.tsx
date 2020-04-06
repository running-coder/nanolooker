import React from "react";
import { Switch, Typography } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { PreferencesContext, Theme } from "api/contexts/Preferences";

const { Text } = Typography;

const ThemePreference: React.FC = () => {
  const { theme, setTheme } = React.useContext(PreferencesContext);

  return (
    <>
      <Text style={{ marginRight: "16px" }}>Enable dark mode</Text>
      <Switch
        checkedChildren={<CheckOutlined />}
        unCheckedChildren={<CloseOutlined />}
        onChange={(checked: boolean) => {
          setTheme(checked ? Theme.DARK : Theme.LIGHT);
        }}
        defaultChecked={theme === Theme.DARK}
      />
    </>
  );
};

export default ThemePreference;
