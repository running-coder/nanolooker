import * as React from "react";

export interface Return {
  nodeMonitors: NodeMonitor[];
  isLoading: boolean;
  isError: boolean;
}

export interface NodeMonitor {
  account: string;
  ip: string;
  rawIp: string;
  weight: number;
  isPrincipal?: boolean;
  monitor: Monitor;
}

interface Monitor {
  url: string;
  active_difficulty: { multiplier: string };
  blockSync: number;
  cementedBlocks: number;
  currentBlock: number;
  nanoNodeName: string;
  nodeLocation: string;
  nodeMonitorVersion: string;
  nodeUptimeStartup: number;
  numPeers: number;
  systemLoad: number;
  systemUptime: string;
  totalMem: number;
  uncheckedBlocks: number;
  usedMem: number;
  version: string;
  storeVersion: string;
}

const useNodeMonitors = (): Return => {
  const [nodeMonitors, setNodeMonitors] = React.useState([] as NodeMonitor[]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);

  const getNodeMonitors = async () => {
    setIsError(false);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/node-monitors`);
      const json = await res.json();

      !json || json.error ? setIsError(true) : setNodeMonitors(json);
    } catch (err) {
      setIsError(true);
    }
    setIsLoading(false);
  };

  React.useEffect(() => {
    getNodeMonitors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { nodeMonitors, isLoading, isError };
};

export default useNodeMonitors;
