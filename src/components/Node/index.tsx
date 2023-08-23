import * as React from "react";
import { useTranslation } from "react-i18next";

import { ReloadOutlined } from "@ant-design/icons";
import { Button, Card, Tooltip } from "antd";
import BigNumber from "bignumber.js";

import { NodeStatusContext } from "api/contexts/NodeStatus";
import useUptime from "api/hooks/use-uptime";
import useVersion from "api/hooks/use-version";
import LoadingStatistic from "components/LoadingStatistic";
import { formatBytes, refreshActionDelay, secondsToTime } from "components/utils";

const Node: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const {
    uptime: { seconds },
  } = useUptime();
  const {
    version: { node_vendor },
  } = useVersion();
  const {
    nodeStatus: { memory: { total = 0 } = {}, nodeStats: { cpu = 0, memory = 0 } = {} },
    getNodeStatus,
    isLoading: isNodeStatusLoading,
  } = React.useContext(NodeStatusContext);
  const [formattedMemory, setFormattedMemory] = React.useState(formatBytes(0));
  const [formattedTotal, setFormattedTotal] = React.useState(formatBytes(0));

  const refreshNode = async () => {
    setIsLoading(true);
    await refreshActionDelay(getNodeStatus);
    setIsLoading(false);
  };

  const opacity = isLoading ? 0.5 : 1;

  React.useEffect(() => {
    setFormattedMemory(formatBytes(memory));
  }, [memory]);

  React.useEffect(() => {
    setFormattedTotal(formatBytes(total));
  }, [total]);

  return (
    <Card
      size="small"
      title={t("common.node")}
      extra={
        <Tooltip title={t("pages.status.reload")}>
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
        title={t("pages.status.version")}
        value={node_vendor}
        isLoading={!node_vendor}
        style={{ opacity }}
      />
      <LoadingStatistic
        title={t("pages.status.uptime")}
        tooltip={t<string>("tooltips.uptime")}
        value={secondsToTime(seconds || 0)}
        isLoading={!node_vendor}
        style={{ opacity }}
      />
      <LoadingStatistic
        title={t("pages.status.cpuUsage")}
        value={new BigNumber(cpu).decimalPlaces(2).toNumber()}
        suffix="%"
        isLoading={isNodeStatusLoading}
        style={{ opacity }}
      />
      <LoadingStatistic
        title={t("pages.status.memory")}
        value={`${new BigNumber(formattedMemory.value).toFormat(2)} / ${new BigNumber(
          formattedTotal.value,
        ).toFormat(2)}`}
        suffix={formattedTotal.suffix}
        isLoading={isNodeStatusLoading}
        style={{ opacity }}
      />
    </Card>
  );
};

export default Node;
