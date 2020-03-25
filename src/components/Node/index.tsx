import React from "react";
import { Button, Card, Tooltip } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { secondsToTime, refreshActionDelay } from "components/utils";
import { NodeStatusContext } from "api/contexts/NodeStatus";
import useUptime from "api/hooks/use-uptime";
import useVersion from "api/hooks/use-version";
import LoadingStatistic from "components/LoadingStatistic";
import BigNumber from "bignumber.js";

const Node: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const {
    uptime: { seconds }
  } = useUptime();
  const {
    version: { node_vendor }
  } = useVersion();
  const {
    nodeStatus: {
      memory: { total = 0 } = {},
      nodeStats: { cpu = 0, memory = 0 } = {}
    },
    getNodeStatus,
    isLoading: isNodeStatusLoading
  } = React.useContext(NodeStatusContext);

  const refreshNode = async () => {
    setIsLoading(true);
    await refreshActionDelay(getNodeStatus);
    setIsLoading(false);
  };

  const opacity = isLoading ? 0.5 : 1;

  return (
    <Card
      size="small"
      title="Node"
      extra={
        <Tooltip title="Reload" overlayClassName="tooltip-sm">
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            size="small"
            onClick={refreshNode}
            loading={isLoading}
          />
        </Tooltip>
      }
    >
      <LoadingStatistic
        title="Version"
        value={node_vendor}
        isLoading={!node_vendor}
        valueStyle={{ opacity }}
      />
      <LoadingStatistic
        title="Uptime"
        value={secondsToTime(seconds || 0)}
        isLoading={!node_vendor}
        valueStyle={{ opacity }}
      />
      <LoadingStatistic
        title="CPU Usage"
        value={cpu}
        suffix="%"
        isLoading={isNodeStatusLoading}
        valueStyle={{ opacity }}
      />
      <LoadingStatistic
        title="Memory"
        value={`${new BigNumber(memory)
          .dividedBy(1000e6)
          .toFormat(2)} / ${new BigNumber(total)
          .dividedBy(1000e6)
          .toFormat(2)}`}
        suffix="GB"
        isLoading={isNodeStatusLoading}
        valueStyle={{ opacity }}
      />
    </Card>
  );
};

export default Node;
