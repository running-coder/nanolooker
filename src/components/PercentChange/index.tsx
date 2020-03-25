import React from "react";
import BigNumber from "bignumber.js";
import { FallOutlined, RiseOutlined } from "@ant-design/icons";
import { Colors } from "components/utils";

interface PercentChangeProps {
  percent: number;
}

const PercentChange: React.FC<PercentChangeProps> = ({ percent }) => {
  const color =
    percent === 0 ? Colors.PENDING : percent < 0 ? Colors.SEND : Colors.RECEIVE;

  const styles = {
    color,
    fontSize: "12px"
  };

  return !isNaN(percent) && percent !== 0 ? (
    <>
      <span
        style={{
          marginRight: "3px",
          ...styles
        }}
      >
        {new BigNumber(percent).toFormat(2)}%
      </span>

      {percent < 0 ? (
        <FallOutlined style={styles} />
      ) : (
        <RiseOutlined style={styles} />
      )}
    </>
  ) : null;
};

export default PercentChange;
