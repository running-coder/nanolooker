import React from "react";
import { Card, Skeleton, Statistic } from "antd";
import { rawToRai, secondsToTime } from "components/utils";
import useUptime from "api/hooks/use-uptime";
import usePeers from "api/hooks/use-peers";
import useVersion from "api/hooks/use-version";
import useAvailableSupply from "api/hooks/use-available-supply";
import useFrontierCount from "api/hooks/use-frontier-count";

const Stats: React.FunctionComponent = () => {
  const {
    uptime: { seconds }
  } = useUptime();
  const { count: peersCount } = usePeers();
  const {
    version: { node_vendor }
  } = useVersion();
  const {
    availableSupply: { available = 0 }
  } = useAvailableSupply();
  const {
    frontierCount: { count: frontierCount }
  } = useFrontierCount();

  return (
    <Card>
      <Skeleton
        active
        loading={
          !available ||
          !node_vendor ||
          !seconds ||
          !peersCount ||
          !frontierCount
        }
      >
        <Statistic title="Version" value={node_vendor} />
        <Statistic title="Uptime" value={secondsToTime(seconds || 0)} />
        <Statistic title="Peers" value={peersCount} />
        <Statistic title="Available Supply" value={rawToRai(available)} />
        <Statistic title="Nano accounts" value={frontierCount} />
      </Skeleton>
    </Card>
  );
};

export default Stats;
