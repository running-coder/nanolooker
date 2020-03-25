import React from "react";
import { Card } from "antd";
import BigNumber from "bignumber.js";
import useAvailableSupply from "api/hooks/use-available-supply";
import useFrontierCount from "api/hooks/use-frontier-count";
import { NodeStatusContext } from "api/contexts/NodeStatus";
import LoadingStatistic from "components/LoadingStatistic";
import { rawToRai } from "components/utils";

const Ledger: React.FC = () => {
  const {
    availableSupply: { available = 0 }
  } = useAvailableSupply();
  const {
    frontierCount: { count: frontierCount }
  } = useFrontierCount();
  const {
    nodeStatus: { ledgerSize },
    isLoading: isNodeStatusLoading
  } = React.useContext(NodeStatusContext);

  return (
    <Card size="small" title="Ledger">
      <LoadingStatistic
        title="Available Supply"
        value={rawToRai(available)}
        isLoading={!available}
      />

      <LoadingStatistic
        title="Nano accounts"
        value={frontierCount}
        isLoading={!frontierCount}
      />

      <LoadingStatistic
        title="Ledger size"
        value={new BigNumber(ledgerSize).dividedBy(1000e6).toFormat(2)}
        suffix="GB"
        isLoading={isNodeStatusLoading}
      />
    </Card>
  );
};

export default Ledger;
