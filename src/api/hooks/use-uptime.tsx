import * as React from "react";

import { rpc } from "api/rpc";

export interface UptimeResponse {
  seconds: string;
}

export interface UseUptimeReturn {
  uptime: UptimeResponse;
  isError: boolean;
}

const ONE_MINUTE = 1000 * 60;
let uptimeTimeout: number | undefined;

const useUptime = (): UseUptimeReturn => {
  const [uptime, setUptime] = React.useState({} as UptimeResponse);
  const [isError, setIsError] = React.useState(false);

  const getUptime = async () => {
    clearTimeout(uptimeTimeout);
    setIsError(false);

    try {
      const json = await rpc("uptime");

      !json || json.error ? setIsError(true) : setUptime(json);
    } catch (err) {
      setIsError(true);
    }

    uptimeTimeout = window.setTimeout(() => {
      getUptime();
    }, ONE_MINUTE);
  };

  React.useEffect(() => {
    function visibilityChange() {
      if (document.visibilityState === "visible") {
        getUptime();
      } else {
        clearTimeout(uptimeTimeout);
      }
    }
    getUptime();
    window.addEventListener("visibilitychange", visibilityChange);

    return () => {
      clearTimeout(uptimeTimeout);
      window.removeEventListener("visibilitychange", visibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { uptime, isError };
};

export default useUptime;
