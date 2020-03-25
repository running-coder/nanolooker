import React from "react";
import { Button, Card, Statistic, Skeleton, Tooltip } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import useActiveDifficulty, {
  UseActiveDifficultyReturn
} from "api/hooks/use-active-difficulty";

import { refreshActionDelay } from "components/utils";

const ActiveDifficulty: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const {
    activeDifficulty: { network_minimum, network_current, multiplier },
    getActiveDifficulty
  }: UseActiveDifficultyReturn = useActiveDifficulty();

  const refreshActiveDifficulty = async () => {
    setIsLoading(true);
    await refreshActionDelay(getActiveDifficulty);
    setIsLoading(false);
  };

  const opacity = isLoading ? 0.5 : 1;

  return (
    <Card
      size="small"
      title="Active Difficulty"
      extra={
        <Tooltip title="Reload" overlayClassName="tooltip-sm">
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            size="small"
            onClick={refreshActiveDifficulty}
            loading={isLoading}
          />
        </Tooltip>
      }
    >
      <Skeleton active loading={!network_current}>
        <Statistic
          title="Network Minimum"
          value={network_minimum}
          valueStyle={{ opacity }}
        />
        <Statistic
          title="Network Current"
          value={network_current}
          valueStyle={{ opacity }}
        />
        <Statistic
          title="Multiplier"
          value={multiplier}
          valueStyle={{ opacity }}
        />
      </Skeleton>
    </Card>
  );
};

export default ActiveDifficulty;
