import React from "react";

export interface ContextProps {
  marketCapRank: number;
  usdMarketCap: number;
  usd24hVolume: number;
  usdCurrentPrice: number;
  usd24hChange: number;
  totalSupply: number;
  circulatingSupply: number;
  isError?: boolean;
}

const GET_DATA_TIMEOUT = 180 * 1000;

export const CoingeckoContext = React.createContext<ContextProps>(
  {} as ContextProps
);

const Provider: React.FunctionComponent = ({ children }) => {
  const [data, setData] = React.useState<ContextProps>({} as ContextProps);
  const [isError, setIsError] = React.useState(false);

  const getCoingeckoData = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/nano?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true&sparkline=true"
      );

      const {
        market_cap_rank: marketCapRank,

        market_data: {
          market_cap: { usd: usdMarketCap },
          total_volume: { usd: usd24hVolume },
          current_price: { usd: usdCurrentPrice },
          price_change_percentage_24h: usd24hChange,
          total_supply: totalSupply,
          circulating_supply: circulatingSupply
        }
      } = await res.json();

      const data = {
        marketCapRank,
        usdMarketCap,
        usd24hVolume,
        usdCurrentPrice,
        usd24hChange,
        totalSupply,
        circulatingSupply
      };

      setData(data);

      setTimeout(() => getCoingeckoData(), GET_DATA_TIMEOUT);
    } catch (e) {
      setIsError(true);
    }
  };

  React.useEffect(() => {
    getCoingeckoData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CoingeckoContext.Provider value={{ ...data, isError }}>
      {children}
    </CoingeckoContext.Provider>
  );
};

export default Provider;
