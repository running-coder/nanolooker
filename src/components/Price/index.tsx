import React from "react";
import { MarketStatisticsContext } from "api/contexts/MarketStatistics";
import PercentChange from "components/PercentChange";

const Price = () => {
  const {
    marketStatistics: { usdCurrentPrice, usd24hChange = 0 }
  } = React.useContext(MarketStatisticsContext);

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <img
        src="/nano.png"
        width="16px"
        alt="Nano currency logo"
        style={{ marginRight: "3px" }}
      />
      <span style={{ marginRight: "6px" }}>${usdCurrentPrice?.toFixed(2)}</span>
      <PercentChange percent={usd24hChange} />
    </div>
  );
};

export default Price;
