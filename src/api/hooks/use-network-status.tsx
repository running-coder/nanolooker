import * as React from "react";

export interface Return {
  networkStatus: NetworkStatus[];
  isLoading: boolean;
  isError: boolean;
}

export interface NetworkStatus {
  account: string;
  ip: string;
  monitor: {
    version: string;
    nodeMonitorVersion: string;
    currentBlock: number;
    uncheckedBlocks: number;
    cementedBlocks: number;
    numPeers: number;
    systemLoad: number;
    systemUptime: string;
    usedMem: number;
    totalMem: number;
    nanoNodeName: string;
    nodeUptimeStartup: number;
    nodeLocation: string;
    active_difficulty: { multiplier: number };
    blockSync: number;
  };
}

const useNetworkStatus = (): Return => {
  const [networkStatus, setNetworkStatus] = React.useState(
    [] as NetworkStatus[],
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);

  const getNetworkStatus = async () => {
    setIsError(false);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/network-status`);
      const json = await res.json();

      !json || json.error ? setIsError(true) : setNetworkStatus(json);
    } catch (err) {}
    setIsLoading(false);
  };

  React.useEffect(() => {
    getNetworkStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { networkStatus, isLoading, isError };
};

export default useNetworkStatus;
