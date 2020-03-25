import React from "react";
import { CoingeckoContext } from "api/contexts/Coingecko";
import PercentChange from "components/PercentChange";

const Price = () => {
  const { usdCurrentPrice, usd24hChange = 0 } = React.useContext(
    CoingeckoContext
  );

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
