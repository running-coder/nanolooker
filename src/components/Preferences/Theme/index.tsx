import React from "react";
import { useTranslation } from "react-i18next";
import { Switch, Typography } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { PreferencesContext, Theme } from "api/contexts/Preferences";

const { Text } = Typography;

interface Props {
  isDetailed?: boolean;
}

const ThemePreference: React.FC<Props> = ({ isDetailed }) => {
  const { t } = useTranslation();
  const { theme, setTheme } = React.useContext(PreferencesContext);

  return (
    <>
      <Text className={isDetailed ? "preference-detailed-title" : ""}>
        {t("preferences.darkMode")}
      </Text>
      <div style={{ display: "flex" }}>
        <Switch
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
          onChange={(checked: boolean) => {
            setTheme(checked ? Theme.DARK : Theme.LIGHT);
          }}
          checked={theme === Theme.DARK}
          // defaultChecked={theme === Theme.DARK}
        />
        {isDetailed ? (
          <Text style={{ marginLeft: "12px" }}>
            {t("preferences.darkModeDetailed")}
          </Text>
        ) : null}
      </div>
    </>
  );
};

export default ThemePreference;
