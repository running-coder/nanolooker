import * as React from "react";

export interface UseUptimeReturn {
  confirmationsPerSecond: number | undefined;
}

let confirmationsPerSecondTimeout: number | undefined;

const useNanoTicker = (): UseUptimeReturn => {
  const [confirmationsPerSecond, setConfirmationsPerSecond] = React.useState<
    number | undefined
  >();

  const getConfirmationsPerSecond = async () => {
    clearTimeout(confirmationsPerSecondTimeout);
    try {
      const res = await fetch("/api/nanoticker");
      const { CPSMedian: cps } = await res.json();

      setConfirmationsPerSecond(cps);
    } catch (err) {
      setConfirmationsPerSecond(undefined);
    }

    confirmationsPerSecondTimeout = window.setTimeout(() => {
      getConfirmationsPerSecond();
    }, 3000);
  };

  React.useEffect(() => {
    function visibilityChange() {
      if (document.visibilityState === "visible") {
        getConfirmationsPerSecond();
      } else {
        clearTimeout(confirmationsPerSecondTimeout);
      }
    }

    getConfirmationsPerSecond();
    window.addEventListener("visibilitychange", visibilityChange);

    return () => {
      clearTimeout(confirmationsPerSecondTimeout);
      window.removeEventListener("visibilitychange", visibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { confirmationsPerSecond };
};

export default useNanoTicker;
