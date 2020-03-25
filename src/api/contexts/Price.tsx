import React from "react";

export interface ContextProps {
  usd?: number;
  usd24hChange?: number;
  btc?: number;
  btc24hChange?: number;
  isError?: boolean;
}

interface CoinGeckoResponse {
  nano: {
    usd: number;
    usd_24h_change: number;
    btc: number;
    btc_24h_change: number;
  };
}

const GET_PRICE_TIMEOUT = 180 * 1000;

export const PriceContext = React.createContext<ContextProps>({});

const Provider: React.FC = ({ children }) => {
  const [price, setPrice] = React.useState<ContextProps>({});
  const [isError, setIsError] = React.useState(false);

  const getPrice = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=nano&vs_currencies=usd%2Cbtc&include_24hr_change=true"
      );

      const {
        nano: {
          usd,
          usd_24h_change: usd24hChange,
          btc,
          btc_24h_change: btc24hChange
        }
      }: CoinGeckoResponse = await res.json();

      setPrice({
        usd: Math.round(usd * 1000) / 1000,
        usd24hChange: Math.round(usd24hChange * 100) / 100,
        btc,
        btc24hChange
      });

      setTimeout(() => getPrice(), GET_PRICE_TIMEOUT);
    } catch (e) {
      setIsError(true);
    }
  };

  React.useEffect(() => {
    getPrice();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PriceContext.Provider value={{ ...price, isError }}>
      {children}
    </PriceContext.Provider>
  );
};

export default Provider;
