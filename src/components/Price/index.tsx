import React from "react";
import { FallOutlined, RiseOutlined } from "@ant-design/icons";
import { CoingeckoContext } from "api/contexts/Coingecko";
import { Colors } from "components/utils";

const Price = () => {
  const { usdCurrentPrice, usd24hChange = 0 } = React.useContext(
    CoingeckoContext
  );

  const color =
    usd24hChange === 0
      ? Colors.PENDING
      : usd24hChange < 0
      ? Colors.SEND
      : Colors.RECEIVE;

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <img
        src="/nano.png"
        width="16px"
        alt="Nano currency logo"
        style={{ marginRight: "3px" }}
      />
      <span style={{ marginRight: "6px" }}>${usdCurrentPrice?.toFixed(2)}</span>
      <span
        style={{
          marginRight: "3px",
          marginTop: "2px",
          fontSize: "12px",
          color
        }}
        title="Change 24h"
      >
        {usd24hChange.toFixed(2)}%
      </span>
      {usd24hChange !== 0 ? (
        <span>
          {usd24hChange < 0 ? (
            <FallOutlined
              style={{
                color
              }}
            />
          ) : (
            <RiseOutlined
              style={{
                color
              }}
            />
          )}
        </span>
      ) : null}
    </div>
  );
};

export default Price;
