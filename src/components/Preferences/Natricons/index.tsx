import React from "react";
import { useTranslation } from "react-i18next";
import { Col, Row, Switch, Typography } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { PreferencesContext } from "api/contexts/Preferences";
import { DEVELOPER_FUND_ACCOUNTS } from "knownAccounts.json";

const { Text } = Typography;

interface Props {
  isDetailed?: boolean;
}

const NatriconsPreferences: React.FC<Props> = ({ isDetailed }) => {
  const { t } = useTranslation();
  const [account] = React.useState(
    DEVELOPER_FUND_ACCOUNTS[
      Math.floor(Math.random() * DEVELOPER_FUND_ACCOUNTS.length - 1)
    ],
  );
  const { natricons, setNatricons } = React.useContext(PreferencesContext);

  return (
    <div style={{ display: "flex", alignItems: "flex-start" }}>
      <img
        alt="natricon"
        src={`https://natricon.com/api/v1/nano?address=${account}&svc=nanolooker`}
        style={{
          marginTop: "-12px",
          marginLeft: "-18px",
          marginBottom: "-18px",
          marginRight: "-6px",
        }}
        width="80px"
        height="80px"
      />

      <Row style={{ width: "100%" }}>
        <Col xs={isDetailed ? 24 : 18}>
          <Text className={isDetailed ? "preference-detailed-title" : ""}>
            {t("preferences.natricons")}
          </Text>
        </Col>
        {isDetailed ? (
          <Col xs={18}>
            <Text>{t("preferences.natriconsDetailed")}</Text>
          </Col>
        ) : null}

        <Col xs={6} style={{ textAlign: "right" }}>
          <Switch
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            onChange={(checked: boolean) => {
              setNatricons(checked);
            }}
            checked={natricons}
          />
        </Col>
      </Row>
    </div>
  );
};

export default NatriconsPreferences;
