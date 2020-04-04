import React from "react";
import { Select, Typography } from "antd";
import { PreferencesContext } from "api/contexts/Preferences";
import { MarketStatisticsContext } from "api/contexts/MarketStatistics";

// @TODO share "Allowed fiats"

const { Option } = Select;
const { Text } = Typography;

const FiatPreferences: React.FC = () => {
  const { fiat, setFiat } = React.useContext(PreferencesContext);
  const { setIsInitialLoading, getMarketStatistics } = React.useContext(
    MarketStatisticsContext
  );

  return (
    <>
      <Text style={{ marginRight: "12px" }}>Change fiat currency</Text>
      <Select
        defaultValue={fiat}
        // style={{ minWidth: 100 }}
        onChange={value => {
          setFiat(value);
          setIsInitialLoading(true);
          getMarketStatistics(value);
        }}
      >
        <Option value="usd">USD</Option>
        <Option value="cad">CAD</Option>
        <Option value="eur">EUR</Option>
      </Select>
    </>
  );
};

export default FiatPreferences;
