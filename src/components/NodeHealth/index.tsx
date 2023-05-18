import * as React from "react";
import { useTranslation } from "react-i18next";

import { Button, message } from "antd";

import { rpc } from "api/rpc";

let rpcAvailableTimeout: number | undefined;

const NodeHealth = () => {
  const { t } = useTranslation();
  const [isRPCAvailable, setIsRPCAvailable] = React.useState(true);
  // const [isWebsocketAvailable, setIsWebsocketAvailable] = React.useState(false);

  React.useEffect(() => {
    function rpcStateChange(_e: Event) {
      setIsRPCAvailable(false);
      message.loading(`${t("nodeHealth.nodeReloading")} ..`, 0);
    }

    window.addEventListener("rpcStateChange", rpcStateChange);

    return () => {
      window.removeEventListener("rpcStateChange", rpcStateChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pingRPC = async () => {
    try {
      const json = await rpc("uptime");

      if (json) {
        message.destroy();
        message.success(
          <>
            {t("nodeHealth.nodeReady")} !
            <Button type="link" onClick={() => window.location.reload()}>
              {t("pages.status.reload")}
            </Button>
          </>,
          0,
        );
        setIsRPCAvailable(true);
      }
    } catch (err) {
      // Silence error
    }

    rpcAvailableTimeout = window.setTimeout(() => {
      pingRPC();
    }, 3000);
  };

  React.useEffect(() => {
    if (isRPCAvailable) {
      clearTimeout(rpcAvailableTimeout);
    } else {
      pingRPC();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRPCAvailable]);

  return <></>;
};

export default NodeHealth;
