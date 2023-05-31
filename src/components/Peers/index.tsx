import React from "react";
import { useTranslation } from "react-i18next";

import { ReloadOutlined } from "@ant-design/icons";
import { Button, Card, Tooltip } from "antd";
import BigNumber from "bignumber.js";
import isEmpty from "lodash/isEmpty";

import usePeers from "api/hooks/use-peers";
import LoadingStatistic from "components/LoadingStatistic";
import { refreshActionDelay } from "components/utils";

let protocolVersions: { [key: string]: number } = {};
let protocolVersion: string = "-";
let percentProtocolVersion: string = "-";

const Peers: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { peers, getPeers, count, isLoading: isPeersLoading } = usePeers();

  const refreshPeers = async () => {
    setIsLoading(true);
    await refreshActionDelay(getPeers);
    setIsLoading(false);
  };

  const opacity = isLoading ? 0.5 : 1;

  React.useEffect(() => {
    if (isEmpty(peers)) return;

    protocolVersions = {};
    Object.values(peers).forEach(({ protocol_version: protocolVersion }) => {
      if (!protocolVersions[protocolVersion]) {
        protocolVersions[protocolVersion] = 1;
      } else {
        protocolVersions[protocolVersion] += 1;
      }
    });

    protocolVersion = Object.keys(protocolVersions).reduce(function (a, b) {
      return protocolVersions[a] > protocolVersions[b] ? a : b;
    });

    percentProtocolVersion = new BigNumber(protocolVersions[protocolVersion])
      .times(100)
      .dividedBy(count)
      .toFormat(2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peers]);

  return (
    <Card
      size="small"
      title={t("pages.status.peers")}
      extra={
        <Tooltip title={t("pages.status.reload")}>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            size="small"
            onClick={refreshPeers}
            loading={isLoading}
          />
        </Tooltip>
      }
    >
      <LoadingStatistic
        title={t("pages.status.connectedPeers")}
        value={count}
        isLoading={isPeersLoading}
        style={{ opacity }}
      />
      <LoadingStatistic
        title={t("pages.status.protocolVersion", {
          protocolVersion,
        })}
        value={percentProtocolVersion}
        suffix="%"
        isLoading={isPeersLoading}
        style={{ opacity }}
      />
    </Card>
  );
};

export default Peers;
