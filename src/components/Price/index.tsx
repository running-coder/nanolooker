import React from "react";
import { Icon } from "antd";
import usePrice from "api/hooks/use-price";

enum Color {
  POSITIVE = "#52c41a",
  NEGATIVE = "#eb2f96"
}

const Price = () => {
  const { usd, usd24hChange } = usePrice();

  const color = (usd24hChange || 0) < 0 ? Color.NEGATIVE : Color.POSITIVE;

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <img
        src="/nano.png"
        width="16px"
        alt="Nano currency logo"
        style={{ marginRight: "3px" }}
      />
      <span style={{ marginRight: "6px" }}>${usd}</span>

      {usd24hChange ? (
        <>
          <span
            style={{
              marginRight: "3px",
              marginTop: "2px",
              fontSize: "12px",
              color
            }}
          >
            {usd24hChange}%
          </span>
          <span>
            <Icon
              type={usd24hChange < 0 ? "fall" : "rise"}
              style={{
                color
              }}
            />
          </span>
        </>
      ) : null}
    </div>
  );
};

export default Price;
