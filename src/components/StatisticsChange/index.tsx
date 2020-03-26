import React from "react";
import BigNumber from "bignumber.js";
import { FallOutlined, RiseOutlined } from "@ant-design/icons";
import { Colors } from "components/utils";

interface StatisticsChangeProps {
  value: number;
  isPercent?: boolean;
  isNumber?: boolean;
}

const StatisticsChange: React.FC<StatisticsChangeProps> = ({
  value,
  isPercent,
  isNumber
}) => {
  const color =
    value === 0 ? Colors.PENDING : value < 0 ? Colors.SEND : Colors.RECEIVE;

  const styles = {
    color,
    fontSize: "12px"
  };

  return !isNaN(value) && value !== Infinity && value !== 0 ? (
    <>
      <span
        style={{
          marginRight: "3px",
          ...styles
        }}
      >
        {isPercent ? `${new BigNumber(value).toFormat(2)}%` : null}
        {isNumber ? value : null}
      </span>

      {value < 0 ? (
        <FallOutlined style={styles} />
      ) : (
        <RiseOutlined style={styles} />
      )}
    </>
  ) : null;
};

export default StatisticsChange;
