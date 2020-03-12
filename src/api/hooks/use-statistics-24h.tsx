import React from "react";

export const TOTAL_CONFIRMATION_KEY_24H = "total_confirmations_24h";
export const TOTAL_NANO_VOLUME_KEY_24H = "total_nano_volume_24h";
export const TOTAL_CONFIRMATION_KEY_48H = "total_confirmations_48h";
export const TOTAL_NANO_VOLUME_KEY_48H = "total_nano_volume_48h";
export const TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H =
  "total_bitcoin_transaction_fees_24h";
export const TOTAL_BITCOIN_TRANSACTION_FEES_KEY_48H =
  "total_bitcoin_transaction_fees_48h";

export interface Response {
  [TOTAL_CONFIRMATION_KEY_24H]: number;
  [TOTAL_NANO_VOLUME_KEY_24H]: number;
  [TOTAL_CONFIRMATION_KEY_48H]: number;
  [TOTAL_NANO_VOLUME_KEY_48H]: number;
  [TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H]: number;
  [TOTAL_BITCOIN_TRANSACTION_FEES_KEY_48H]: number;
}

export interface Return {
  getStatistics24h: Function;
  isError: boolean;
}

export const Statistics24hContext = React.createContext<Return & Response>({
  [TOTAL_CONFIRMATION_KEY_24H]: 0,
  [TOTAL_NANO_VOLUME_KEY_24H]: 0,
  [TOTAL_CONFIRMATION_KEY_48H]: 0,
  [TOTAL_NANO_VOLUME_KEY_48H]: 0,
  [TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H]: 0,
  [TOTAL_BITCOIN_TRANSACTION_FEES_KEY_48H]: 0,
  getStatistics24h: () => {},
  isError: false
});

let pollStatistics24hIntervallet: number | undefined;

const useStatistics24h = (): Return & Response => {
  const [statistics24h, setStatistics24h] = React.useState({} as Response);
  const [isError, setIsError] = React.useState(false);

  const getStatistics24h = async () => {
    const res = await fetch("/api/statistics");
    const json = await res.json();

    !json ? setIsError(true) : setStatistics24h(json);

    pollStatistics24hIntervallet = window.setTimeout(getStatistics24h, 5000);
  };

  React.useEffect(() => {
    getStatistics24h();

    return () => clearTimeout(pollStatistics24hIntervallet);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ...statistics24h, getStatistics24h, isError };
};

export default useStatistics24h;
