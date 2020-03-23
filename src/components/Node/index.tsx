import React from "react";
import { Button, Card, Tooltip } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { secondsToTime, refreshActionDelay } from "components/utils";
import useUptime from "api/hooks/use-uptime";
import useVersion from "api/hooks/use-version";
import LoadingStatistic from "components/LoadingStatistic";

const Node: React.FunctionComponent = () => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const {
    uptime: { seconds }
  } = useUptime();
  const {
    version: { node_vendor }
  } = useVersion();

  const refreshNode = async () => {
    setIsLoading(true);
    await refreshActionDelay(() => {});
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
        value="TBD"
        isLoading={false}
        valueStyle={{ opacity }}
      />
      <LoadingStatistic
        title="Memory"
        value="TBD"
        isLoading={false}
        valueStyle={{ opacity }}
      />
    </Card>
  );
};

export default Node;
