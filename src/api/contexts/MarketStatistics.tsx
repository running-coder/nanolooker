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
  marketCapRank: number;
  marketCapRank24h: number;
  usdMarketCap: number;
  marketCapChangePercentage24h: number;
  usd24hVolume: number;
  usdCurrentPrice: number;
  usd24hChange: number;
  totalSupply: number;
  circulatingSupply: number;
  usdBtcCurrentPrice: number;
}

export interface Context {
  marketStatistics: Response;
  getMarketStatistics: Function;
  isInitialLoading: boolean;
  isLoading: boolean;
  isError: boolean;
}

let pollMarketStatisticsInterval: number | undefined;

export const MarketStatisticsContext = React.createContext<Context>({
  marketStatistics: {
    [TOTAL_CONFIRMATION_KEY_24H]: 0,
    [TOTAL_NANO_VOLUME_KEY_24H]: 0,
    [TOTAL_CONFIRMATION_KEY_48H]: 0,
    [TOTAL_NANO_VOLUME_KEY_48H]: 0,
    [TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H]: 0,
    [TOTAL_BITCOIN_TRANSACTION_FEES_KEY_48H]: 0,
    marketCapRank: 0,
    marketCapRank24h: 0,
    usdMarketCap: 0,
    marketCapChangePercentage24h: 0,
    usd24hVolume: 0,
    usdCurrentPrice: 0,
    usd24hChange: 0,
    totalSupply: 0,
    circulatingSupply: 0,
    usdBtcCurrentPrice: 0
  },
  getMarketStatistics: () => {},
  isInitialLoading: false,
  isLoading: false,
  isError: false
});

const Provider: React.FC = ({ children }) => {
  const [marketStatistics, setMarketStatistics] = React.useState(
    {} as Response
  );
  const [isInitialLoading, setIsInitialLoading] = React.useState<boolean>(true);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isError, setIsError] = React.useState<boolean>(false);

  const getMarketStatistics = async () => {
    setIsError(false);
    setIsLoading(true);
    const res = await fetch("/api/market-statistics");
    const json = await res.json();

    !json || json.error ? setIsError(true) : setMarketStatistics(json);
    setIsInitialLoading(false);
    setIsLoading(false);

    pollMarketStatisticsInterval = window.setTimeout(getMarketStatistics, 5000);
  };

  React.useEffect(() => {
    getMarketStatistics();

    return () => clearInterval(pollMarketStatisticsInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MarketStatisticsContext.Provider
      value={{
        marketStatistics,
        getMarketStatistics,
        isInitialLoading,
        isLoading,
        isError
      }}
    >
      {children}
    </MarketStatisticsContext.Provider>
  );
};

export default Provider;
