import * as React from "react";
import { Statistic, Tooltip } from "antd";
import QuestionCircle from "components/QuestionCircle";
import useConfirmationsPerSecond from "api/hooks/use-confirmations-per-second";

const ConfirmationsPerSecond = () => {
  const { confirmationsPerSecond } = useConfirmationsPerSecond();

  return confirmationsPerSecond ? (
    <div className="cps-container">
      <Statistic
        suffix="CPS"
        value={confirmationsPerSecond}
        style={{ display: "inline-block", marginRight: "6px" }}
      ></Statistic>
      <Tooltip
        placement="right"
        title={`Confirmations Per Second. The rate of confirmed blocks (send or receive) on the NANO network.`}
      >
        <QuestionCircle />
      </Tooltip>
    </div>
  ) : null;
};

export default ConfirmationsPerSecond;
