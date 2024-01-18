import * as React from "react";

import qs from "qs";

import { PreferencesContext } from "./Preferences";

export const TOTAL_CONFIRMATIONS_24H = "TOTAL_CONFIRMATIONS_24H";
export const TOTAL_CONFIRMATIONS_7D = "TOTAL_CONFIRMATIONS_7D";
export const TOTAL_CONFIRMATIONS_14D = "TOTAL_CONFIRMATIONS_14D";
export const TOTAL_VOLUME_24H = "TOTAL_VOLUME_24H";
export const TOTAL_CONFIRMATIONS_48H = "TOTAL_CONFIRMATIONS_48H";
export const TOTAL_VOLUME_7D = "TOTAL_VOLUME_7D";
export const TOTAL_VOLUME_14D = "TOTAL_VOLUME_14D";
export const TOTAL_VOLUME_48H = "TOTAL_VOLUME_48H";
export const BITCOIN_TOTAL_TRANSACTION_FEES_24H = "BITCOIN_TOTAL_TRANSACTION_FEES_24H";
export const BITCOIN_TOTAL_TRANSACTION_FEES_7D = "BITCOIN_TOTAL_TRANSACTION_FEES_7D";
export const BITCOIN_TOTAL_TRANSACTION_FEES_14D = "BITCOIN_TOTAL_TRANSACTION_FEES_14D";
export const BITCOIN_TOTAL_TRANSACTION_FEES_48H = "BITCOIN_TOTAL_TRANSACTION_FEES_48H";
export const NANOTPS_STATS = "NANOTPS_STATS";
export const NANOSPEED_STATS = "NANOSPEED_STATS";

export interface Response {
  [TOTAL_CONFIRMATIONS_24H]: number;
  [TOTAL_CONFIRMATIONS_48H]: number;
  [TOTAL_CONFIRMATIONS_7D]: number;
  [TOTAL_CONFIRMATIONS_14D]: number;
  [TOTAL_VOLUME_24H]: number;
  [TOTAL_VOLUME_48H]: number;
  [TOTAL_VOLUME_7D]: number;
  [TOTAL_VOLUME_14D]: number;
  [BITCOIN_TOTAL_TRANSACTION_FEES_24H]: number;
  [BITCOIN_TOTAL_TRANSACTION_FEES_7D]: number;
  [BITCOIN_TOTAL_TRANSACTION_FEES_14D]: number;
  [BITCOIN_TOTAL_TRANSACTION_FEES_48H]: number;
  [NANOTPS_STATS]: any;
  [NANOTPS_STATS]: any;
  marketCapRank: number;
  marketCapRank24h: number;
  marketCap: number;
  marketCapChangePercentage24h: number;
  volume24h: number;
  currentPrice: number;
  change24h: number;
  totalSupply: number;
  circulatingSupply: number;
  priceStats: any;
  NANOSPEED_STATS: {
    median: number | null;
    avgConfTimep90: number | null;
  };
}

export interface Context {
  marketStatistics: Response;
  getMarketStatistics: Function;
  isInitialLoading: boolean;
  setIsInitialLoading: Function;
  isLoading: boolean;
  is24Hours: boolean;
  setIs24Hours: Function;
  isError: boolean;
}

let pollMarketStatisticsTimeout: number | undefined;

export const MarketStatisticsContext = React.createContext<Context>({
  marketStatistics: {
    [TOTAL_CONFIRMATIONS_24H]: 0,
    [TOTAL_CONFIRMATIONS_48H]: 0,
    [TOTAL_CONFIRMATIONS_7D]: 0,
    [TOTAL_CONFIRMATIONS_14D]: 0,
    [TOTAL_VOLUME_24H]: 0,
    [TOTAL_VOLUME_48H]: 0,
    [TOTAL_VOLUME_7D]: 0,
    [TOTAL_VOLUME_14D]: 0,
    [BITCOIN_TOTAL_TRANSACTION_FEES_24H]: 0,
    [BITCOIN_TOTAL_TRANSACTION_FEES_7D]: 0,
    [BITCOIN_TOTAL_TRANSACTION_FEES_14D]: 0,
    [BITCOIN_TOTAL_TRANSACTION_FEES_48H]: 0,

    NANOTPS_STATS: {},
    [NANOSPEED_STATS]: {
      median: null,
      avgConfTimep90: null,
    },
    marketCapRank: 0,
    marketCapRank24h: 0,
    marketCap: 0,
    marketCapChangePercentage24h: 0,
    volume24h: 0,
    currentPrice: 0,
    change24h: 0,
    totalSupply: 0,
    circulatingSupply: 0,
    priceStats: {},
  },
  getMarketStatistics: () => {},
  setIsInitialLoading: () => {},
  isInitialLoading: false,
  setIs24Hours: () => {},
  isLoading: false,
  is24Hours: true,
  isError: false,
});

interface Props {
  children: React.ReactNode;
}

const Provider: React.FC<Props> = ({ children }) => {
  const [marketStatistics, setMarketStatistics] = React.useState({} as Response);
  const [isInitialLoading, setIsInitialLoading] = React.useState<boolean>(true);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [is24Hours, setIs24Hours] = React.useState<boolean>(true);
  const [isError, setIsError] = React.useState<boolean>(false);
  const { fiat, cryptocurrency } = React.useContext(PreferencesContext);

  const getMarketStatistics = async (fiat: string) => {
    clearTimeout(pollMarketStatisticsTimeout);
    let isError = false;

    setIsLoading(true);
    try {
      const query = qs.stringify(
        { fiat, cryptocurrency: !!cryptocurrency?.length, is24Hours },
        {
          addQueryPrefix: true,
        },
      );
      const res = await fetch(`/api/market-statistics${query}`);
      const json = await res.json();

      if (!json || json.error) {
        isError = true;
      } else {
        setMarketStatistics(json);
      }
    } catch (e) {
      isError = true;
    }
    setIsInitialLoading(false);
    setIsLoading(false);
    setIsError(isError);

    pollMarketStatisticsTimeout = window.setTimeout(
      () => {
        getMarketStatistics(fiat);
      },
      isError ? 5000 : 25000,
    );
  };

  React.useEffect(() => {
    getMarketStatistics(fiat);

    return () => {
      clearTimeout(pollMarketStatisticsTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cryptocurrency]);

  React.useEffect(() => {
    function visibilityChange() {
      if (document.visibilityState === "visible") {
        getMarketStatistics(fiat);
      } else {
        clearTimeout(pollMarketStatisticsTimeout);
      }
    }

    window.addEventListener("visibilitychange", visibilityChange);

    return () => {
      window.removeEventListener("visibilitychange", visibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MarketStatisticsContext.Provider
      value={{
        marketStatistics,
        getMarketStatistics,
        isInitialLoading,
        setIsInitialLoading,
        isLoading,
        is24Hours,
        setIs24Hours,
        isError,
      }}
    >
      {children}
    </MarketStatisticsContext.Provider>
  );
};

export default Provider;
