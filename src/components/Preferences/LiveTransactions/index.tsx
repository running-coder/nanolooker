import * as React from "react";
import { useTranslation } from "react-i18next";

import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Col, Row, Switch, Typography } from "antd";

import { PreferencesContext } from "api/contexts/Preferences";

const { Text } = Typography;

interface Props {
  isDetailed?: boolean;
}

const LivePreference: React.FC<Props> = ({ isDetailed }) => {
  const { t } = useTranslation();
  const { disableLiveTransactions, setDisableLiveTransactions } =
    React.useContext(PreferencesContext);

  return (
    <Row>
      <Col xs={isDetailed ? 24 : 18}>
        <Text className={isDetailed ? "preference-detailed-title" : ""}>
          {t("preferences.liveTransactions")}
        </Text>
      </Col>
      {isDetailed ? (
        <Col xs={18}>
          <Text>{t("preferences.liveTransactionsDetailed")}</Text>
        </Col>
      ) : null}

      <Col xs={6} style={{ textAlign: "right" }}>
        <Switch
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
          onChange={(checked: boolean) => {
            setDisableLiveTransactions(!checked);
          }}
          checked={!disableLiveTransactions}
        />
      </Col>
    </Row>
  );
};

export default LivePreference;
