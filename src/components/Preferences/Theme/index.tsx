import React from "react";
import { Switch, Typography } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { PreferencesContext, Themes } from "api/contexts/Preferences";

const { Text } = Typography;

const ThemePreference: React.FC = () => {
  const { theme, setTheme } = React.useContext(PreferencesContext);

  return (
    <>
      <Text style={{ marginRight: "16px" }}>Enable dark mode</Text>
      <Switch
        disabled
        checkedChildren={<CheckOutlined />}
        unCheckedChildren={<CloseOutlined />}
        onChange={(checked: boolean) => {
          setTheme(checked ? Themes.DARK : Themes.LIGHT);
        }}
        defaultChecked={theme === Themes.DARK}
      />
    </>
  );
};

export default ThemePreference;
