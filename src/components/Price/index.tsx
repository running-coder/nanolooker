import React from "react";
import { Icon } from "antd";
import { PriceContext } from "api/contexts/Price";

export enum Color {
  NEUTRAL = "#1890ff",
  POSITIVE = "#52c41a",
  NEGATIVE = "#f5222d"
}

const Price = () => {
  const { usd, usd24hChange = 0 } = React.useContext(PriceContext);

  const color =
    usd24hChange === 0
      ? Color.NEUTRAL
      : usd24hChange < 0
      ? Color.NEGATIVE
      : Color.POSITIVE;

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <img
        src="/nano.png"
        width="16px"
        alt="Nano currency logo"
        style={{ marginRight: "3px" }}
      />
      <span style={{ marginRight: "6px" }}>${usd?.toFixed(2)}</span>
      <span
        style={{
          marginRight: "3px",
          marginTop: "2px",
          fontSize: "12px",
          color
        }}
        title="Change 24h"
      >
        {usd24hChange}%
      </span>
      {usd24hChange !== 0 ? (
        <span>
          <Icon
            type={usd24hChange < 0 ? "fall" : "rise"}
            style={{
              color
            }}
          />
        </span>
      ) : null}
    </div>
  );
};

export default Price;
