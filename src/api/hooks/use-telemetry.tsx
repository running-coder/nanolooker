import * as React from "react";

export enum Percentiles {
  P50 = "p50",
  P95 = "p95",
  P100 = "p100",
}

export interface Return {
  telemetry: { [key in Percentiles]: Telemetry };
  status: Status;
  isLoading: boolean;
  isError: boolean;
}

interface Telemetry {
  blockCount: number;
  cementedCount: number;
  uncheckedCount: number;
  accountCount: number;
  bandwidthCap: number;
  peerCount: number;
  uptime: number;
  activeDifficulty: number;
}

interface Status {
  nodeCount: number;
  date: number;
  bandwidthCapGroups: BandwidthCapGroup[];
}

interface BandwidthCapGroup {
  count: number;
  bandwidthCap: number;
}

const useTelemetry = (): Return => {
  const [telemetry, setTelemetry] = React.useState({} as Return["telemetry"]);
  const [status, setStatus] = React.useState({} as Return["status"]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);

  const getTelemetry = async () => {
    setIsError(false);
    setIsLoading(true);

    const res = await fetch(`/api/telemetry`);
    const json = await res.json();

    if (!json || json.error) {
      setIsError(true);
    } else {
      setTelemetry(json.telemetry || {});
      setStatus(json.status || {});
    }

    setIsLoading(false);
  };

  React.useEffect(() => {
    getTelemetry();
  }, []);

  return { telemetry, status, isLoading, isError };
};

export default useTelemetry;
