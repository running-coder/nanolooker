import React from "react";
import BigNumber from "bignumber.js";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  FallOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import { Colors } from "components/utils";
import { Theme, PreferencesContext } from "api/contexts/Preferences";

interface StatisticsChangeProps {
  value: number;
  isPercent?: boolean;
  isNumber?: boolean;
  isArrow?: boolean;
}

const StatisticsChange: React.FC<StatisticsChangeProps> = ({
  value,
  isPercent,
  isNumber,
  isArrow,
}) => {
  const { theme } = React.useContext(PreferencesContext);
  const color = (value === 0
    ? Colors.PENDING
    : value < 0
    ? theme === Theme.DARK
      ? Colors.SEND_DARK
      : Colors.SEND
    : theme === Theme.DARK
    ? Colors.RECEIVE_DARK
    : Colors.RECEIVE) as string;

  const styles = {
    color,
    fontSize: "12px",
  };

  return !isNaN(value) && value !== Infinity ? (
    <>
      <span
        style={{
          marginRight: "3px",
          ...styles,
        }}
      >
        {isPercent ? `${new BigNumber(value).toFormat(2)}%` : null}
        {isNumber ? value : null}
      </span>

      {value >= 0 ? (
        isArrow ? (
          <ArrowUpOutlined style={styles} />
        ) : (
          <RiseOutlined style={styles} />
        )
      ) : isArrow ? (
        <ArrowDownOutlined style={styles} />
      ) : (
        <FallOutlined style={styles} />
      )}
    </>
  ) : null;
};

export default StatisticsChange;
