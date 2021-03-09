import React from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, Statistic, Skeleton, Tooltip } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { refreshActionDelay } from "components/utils";
import { BlockCountContext } from "api/contexts/BlockCount";

const POLL_INTERVAL = 1000 * 30;

const BlockCount: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = React.useState(false);
  const { count, unchecked, cemented, getBlockCount } = React.useContext(
    BlockCountContext,
  );

  const refreshBlockCount = async () => {
    setIsLoading(true);
    await refreshActionDelay(getBlockCount);
    setIsLoading(false);
  };

  React.useEffect(() => {
    let interval: number = window.setInterval(() => {
      try {
        getBlockCount();
      } catch (_e) {
        clearInterval(interval);
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const opacity = isLoading ? 0.5 : 1;

  return (
    <Card
      size="small"
      title={t("pages.status.blockCount")}
      extra={
        <Tooltip title={t("pages.status.reload")}>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            size="small"
            onClick={refreshBlockCount}
            loading={isLoading}
          />
        </Tooltip>
      }
    >
      <Skeleton active loading={!count}>
        <Statistic
          title={t("pages.status.count")}
          value={count}
          valueStyle={{ opacity }}
        />
        <Statistic
          title={t("pages.status.unchecked")}
          value={unchecked}
          valueStyle={{ opacity }}
        />
        <Statistic
          title={t("pages.status.cemented")}
          value={cemented}
          valueStyle={{ opacity }}
        />
      </Skeleton>
    </Card>
  );
};

export default BlockCount;
