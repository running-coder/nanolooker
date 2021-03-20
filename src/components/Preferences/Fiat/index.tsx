import React from "react";
import { useTranslation } from "react-i18next";
import { Select, Typography } from "antd";
import { PreferencesContext, Fiat } from "api/contexts/Preferences";
import { MarketStatisticsContext } from "api/contexts/MarketStatistics";

// @TODO share "Allowed fiats"

const { Option } = Select;
const { Text } = Typography;

interface Props {
  isDetailed?: boolean;
}

const FiatPreferences: React.FC<Props> = ({ isDetailed }) => {
  const { t } = useTranslation();
  const { fiat, setFiat } = React.useContext(PreferencesContext);
  const { setIsInitialLoading, getMarketStatistics } = React.useContext(
    MarketStatisticsContext,
  );

  return (
    <>
      <Text className={isDetailed ? "preference-detailed-title" : ""}>
        {t("preferences.fiatCurrency")}
      </Text>
      <div style={{ display: "flex" }}>
        <div>
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
        </div>
        {isDetailed ? (
          <Text style={{ marginLeft: "12px", alignSelf: "center" }}>
            {t("preferences.fiatCurrencyDetailed")}
          </Text>
        ) : null}
      </div>
    </>
  );
};

export default FiatPreferences;
