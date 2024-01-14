import * as React from "react";

import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import BigNumber from "bignumber.js";

import { PreferencesContext, Theme } from "api/contexts/Preferences";
import { Colors } from "components/utils";

interface StatisticsChangeProps {
  value: number;
  isPercent?: boolean;
  isNumber?: boolean;
  suffix?: any;
}

const StatisticsChange: React.FC<StatisticsChangeProps> = ({
  value: rawValue,
  isPercent,
  isNumber,
  suffix,
}) => {
  let value = rawValue;
  const { theme } = React.useContext(PreferencesContext);
  const color = (
    value === 0
      ? Colors.PENDING
      : value < 0
      ? theme === Theme.DARK
        ? Colors.SEND_DARK
        : Colors.SEND
      : theme === Theme.DARK
      ? Colors.RECEIVE_DARK
      : Colors.RECEIVE
  ) as string;

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

      {value >= 0 ? <ArrowUpOutlined style={styles} /> : <ArrowDownOutlined style={styles} />}

      {suffix}
    </>
  ) : null;
};

export default StatisticsChange;
