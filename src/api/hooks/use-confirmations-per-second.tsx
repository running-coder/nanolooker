import * as React from "react";

export interface UseUptimeReturn {
  confirmationsPerSecond: string | undefined;
}

let confirmationsPerSecondTimeout: number | undefined;

const useConfirmationsPerSecond = (): UseUptimeReturn => {
  const [confirmationsPerSecond, setConfirmationsPerSecond] = React.useState<string | undefined>();

  const getConfirmationsPerSecond = async () => {
    clearTimeout(confirmationsPerSecondTimeout);
    try {
      const res = await fetch(`/api/confirmations-per-second`);
      const { cps } = await res.json();

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

export default useConfirmationsPerSecond;
