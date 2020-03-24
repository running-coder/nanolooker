import React from "react";
import { Button, Card, Skeleton, Statistic, Tooltip } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import BigNumber from "bignumber.js";
import useAvailableSupply from "api/hooks/use-available-supply";
import useFrontierCount from "api/hooks/use-frontier-count";
import { NodeStatusContext } from "api/contexts/NodeStatus";
import LoadingStatistic from "components/LoadingStatistic";
import { rawToRai, refreshActionDelay } from "components/utils";

const Ledger: React.FunctionComponent = () => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const {
    availableSupply: { available = 0 }
  } = useAvailableSupply();
  const {
    frontierCount: { count: frontierCount },
    getFrontierCount
    // isLoading: isFrontierCountLoading
  } = useFrontierCount();
  const {
    nodeStatus: { ledgerSize },
    isLoading: isNodeStatusLoading
  } = React.useContext(NodeStatusContext);

  const refreshLedger = async () => {
    setIsLoading(true);
    await refreshActionDelay(getFrontierCount);
    setIsLoading(false);
  };

  const opacity = isLoading ? 0.5 : 1;

  return (
    <Card
      size="small"
      title="Ledger"
      extra={
        <Tooltip title="Reload" overlayClassName="tooltip-sm">
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            size="small"
            onClick={refreshLedger}
            loading={isLoading}
          />
        </Tooltip>
      }
    >
      <LoadingStatistic
        title="Available Supply"
        value={rawToRai(available)}
        isLoading={!available}
        valueStyle={{ opacity }}
      />

      <LoadingStatistic
        title="Nano accounts"
        value={frontierCount}
        isLoading={!frontierCount}
        valueStyle={{ opacity }}
      />

      <LoadingStatistic
        title="Ledger size"
        value={new BigNumber(ledgerSize).dividedBy(1000e6).toFormat(2)}
        suffix="GB"
        isLoading={isNodeStatusLoading}
        valueStyle={{ opacity }}
      />
    </Card>
  );
};

export default Ledger;
