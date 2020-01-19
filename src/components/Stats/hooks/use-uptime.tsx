import React from "react";
import { rpc } from "api/rpc";

export interface UptimeResponse {
  seconds: string;
}

export interface UseUptimeReturn {
  uptime: UptimeResponse;
}

const ONE_MINUTE = 1000 * 60;

const useUptime = (): UseUptimeReturn => {
  const [uptime, setUptime] = React.useState({} as UptimeResponse);

  const getUptime = async () => {
    const json = (await rpc("uptime")) || {};
    setUptime(json);
  };

  React.useEffect(() => {
    if (!uptime?.seconds) return;

    setTimeout(() => {
      setUptime({
        seconds: (parseInt(uptime.seconds) + 60).toString()
      });
    }, ONE_MINUTE);
  }, [uptime]);

  React.useEffect(() => {
    getUptime();
  }, []);

  return { uptime };
};

export default useUptime;
