import * as React from "react";
import qs from "qs";
import { PreferencesContext, Fiat } from "./Preferences";

export const TOTAL_CONFIRMATIONS_KEY_24H = "TOTAL_CONFIRMATIONS_24H";
export const TOTAL_NANO_VOLUME_KEY_24H = "TOTAL_NANO_VOLUME_24H";
export const TOTAL_CONFIRMATIONS_KEY_48H = "TOTAL_CONFIRMATIONS_48H";
export const TOTAL_NANO_VOLUME_KEY_48H = "TOTAL_NANO_VOLUME_48H";
export const TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H =
  "TOTAL_BITCOIN_TRANSACTION_FEES_24H";
export const TOTAL_BITCOIN_TRANSACTION_FEES_KEY_48H =
  "TOTAL_BITCOIN_TRANSACTION_FEES_48H";

export interface Response {
  [TOTAL_CONFIRMATIONS_KEY_24H]: number;
  [TOTAL_NANO_VOLUME_KEY_24H]: number;
  [TOTAL_CONFIRMATIONS_KEY_48H]: number;
  [TOTAL_NANO_VOLUME_KEY_48H]: number;
  [TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H]: number;
  [TOTAL_BITCOIN_TRANSACTION_FEES_KEY_48H]: number;
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
}

export interface Context {
  marketStatistics: Response;
  getMarketStatistics: Function;
  isInitialLoading: boolean;
  setIsInitialLoading: Function;
  isLoading: boolean;
  isError: boolean;
}

let pollMarketStatisticsTimeout: number | undefined;

export const MarketStatisticsContext = React.createContext<Context>({
  marketStatistics: {
    [TOTAL_CONFIRMATIONS_KEY_24H]: 0,
    [TOTAL_NANO_VOLUME_KEY_24H]: 0,
    [TOTAL_CONFIRMATIONS_KEY_48H]: 0,
    [TOTAL_NANO_VOLUME_KEY_48H]: 0,
    [TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H]: 0,
    [TOTAL_BITCOIN_TRANSACTION_FEES_KEY_48H]: 0,
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
  isLoading: false,
  isError: false,
});

const Provider: React.FC = ({ children }) => {
  const [marketStatistics, setMarketStatistics] = React.useState(
    {} as Response,
  );
  const [isInitialLoading, setIsInitialLoading] = React.useState<boolean>(true);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isError, setIsError] = React.useState<boolean>(false);
  const { fiat } = React.useContext(PreferencesContext);

  const getMarketStatistics = async (fiat: string) => {
    clearTimeout(pollMarketStatisticsTimeout);

    setIsError(false);
    setIsLoading(true);
    try {
      const query = qs.stringify(
        { ...(fiat !== Fiat.USD ? { fiat } : null) },
        {
          addQueryPrefix: true,
        },
      );
      const res = await fetch(`/api/market-statistics${query}`);
      const json = await res.json();

      !json || json.error ? setIsError(true) : setMarketStatistics(json);
    } catch (e) {
      setIsError(true);
    }
    setIsInitialLoading(false);
    setIsLoading(false);

    pollMarketStatisticsTimeout = window.setTimeout(() => {
      getMarketStatistics(fiat);
    }, 7500);
  };

  React.useEffect(() => {
    function visibilityChange() {
      if (document.visibilityState === "visible") {
        getMarketStatistics(fiat);
      } else {
        clearTimeout(pollMarketStatisticsTimeout);
      }
    }

    getMarketStatistics(fiat);
    window.addEventListener("visibilitychange", visibilityChange);

    return () => {
      clearTimeout(pollMarketStatisticsTimeout);
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
        isError,
      }}
    >
      {children}
    </MarketStatisticsContext.Provider>
  );
};

export default Provider;
