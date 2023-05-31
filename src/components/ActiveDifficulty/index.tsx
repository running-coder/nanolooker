import * as React from "react";
import { useTranslation } from "react-i18next";

import { ReloadOutlined } from "@ant-design/icons";
import { Button, Card, Skeleton, Statistic, Tooltip } from "antd";

import useActiveDifficulty, { UseActiveDifficultyReturn } from "api/hooks/use-active-difficulty";
import { refreshActionDelay } from "components/utils";

const ActiveDifficulty: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = React.useState(false);
  const {
    activeDifficulty: { network_minimum, network_current, multiplier },
    getActiveDifficulty,
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
      title={t("pages.status.activeDifficulty")}
      extra={
        <Tooltip title={t("pages.status.reload")}>
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
          title={t("pages.status.networkMinimum")}
          value={network_minimum}
          style={{ opacity }}
        />
        <Statistic
          title={t("pages.status.networkCurrent")}
          value={network_current}
          style={{ opacity }}
        />
        <Statistic title={t("pages.status.multiplier")} value={multiplier} style={{ opacity }} />
      </Skeleton>
    </Card>
  );
};

export default ActiveDifficulty;
