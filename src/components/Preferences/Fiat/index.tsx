import * as React from "react";
import { useTranslation } from "react-i18next";

import { Col, Row, Select, Typography } from "antd";

import { MarketStatisticsContext } from "api/contexts/MarketStatistics";
import { Fiat, PreferencesContext } from "api/contexts/Preferences";

const { Option } = Select;
const { Text } = Typography;

interface Props {
  isDetailed?: boolean;
}

const FiatPreferences: React.FC<Props> = ({ isDetailed }) => {
  const { t } = useTranslation();
  const { fiat, setFiat } = React.useContext(PreferencesContext);
  const { setIsInitialLoading, getMarketStatistics } = React.useContext(MarketStatisticsContext);

  return (
    <Row style={{ alignItems: !isDetailed ? "center" : "flex-start" }}>
      <Col xs={isDetailed ? 24 : 18}>
        <Text className={isDetailed ? "preference-detailed-title" : ""}>
          {t("preferences.fiatCurrency")}
        </Text>
      </Col>
      {isDetailed ? (
        <Col xs={18}>
          <Text>{t("preferences.fiatCurrencyDetailed")}</Text>
        </Col>
      ) : null}

      <Col xs={6} style={{ textAlign: "right" }}>
        <Select
          defaultValue={fiat}
          onChange={value => {
            setFiat(value);
            setIsInitialLoading(true);
            getMarketStatistics(value);
          }}
        >
          {Object.entries(Fiat).map(([key, value]) => (
            <Option value={value} key={key}>
              {key}
            </Option>
          ))}
        </Select>
      </Col>
    </Row>
  );
};

export default FiatPreferences;
