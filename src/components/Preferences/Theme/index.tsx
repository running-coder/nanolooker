import * as React from "react";
import { useTranslation } from "react-i18next";

import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Col, Row, Switch, Typography } from "antd";

import { PreferencesContext, Theme } from "api/contexts/Preferences";

const { Text } = Typography;

interface Props {
  isDetailed?: boolean;
}

const ThemePreference: React.FC<Props> = ({ isDetailed }) => {
  const { t } = useTranslation();
  const { theme, setTheme } = React.useContext(PreferencesContext);

  return (
    <Row>
      <Col xs={isDetailed ? 24 : 18}>
        <Text className={isDetailed ? "preference-detailed-title" : ""}>
          {t("preferences.darkMode")}
        </Text>
      </Col>
      {isDetailed ? (
        <Col xs={18}>
          <Text>{t("preferences.darkModeDetailed")}</Text>
        </Col>
      ) : null}

      <Col xs={6} style={{ textAlign: "right" }}>
        <Switch
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
          onChange={(checked: boolean) => {
            setTheme(checked ? Theme.DARK : Theme.LIGHT);
          }}
          checked={theme === Theme.DARK}
        />
      </Col>
    </Row>
  );
};

export default ThemePreference;
