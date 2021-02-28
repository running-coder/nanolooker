import React from "react";

export interface UseUptimeReturn {
  confirmationsPerSecond: string | undefined;
}

let confirmationsPerSecondInterval: number | undefined;

const useConfirmationsPerSecond = (): UseUptimeReturn => {
  const [confirmationsPerSecond, setConfirmationsPerSecond] = React.useState();

  const getConfirmationsPerSecond = async () => {
    try {
      const res = await fetch(`/api/confirmations-per-second`);
      const { cps } = await res.json();

      setConfirmationsPerSecond(cps);
    } catch (err) {
      setConfirmationsPerSecond(undefined);
    }

    confirmationsPerSecondInterval = window.setTimeout(() => {
      getConfirmationsPerSecond();
    }, 3000);
  };

  React.useEffect(() => {
    getConfirmationsPerSecond();

    return () => clearInterval(confirmationsPerSecondInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { confirmationsPerSecond };
};

export default useConfirmationsPerSecond;
