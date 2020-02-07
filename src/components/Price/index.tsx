import React from "react";
import { Icon } from "antd";
import { PriceContext } from "api/contexts/Price";
import { Colors } from "components/utils";

const Price = () => {
  const { usd, usd24hChange = 0 } = React.useContext(PriceContext);

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
