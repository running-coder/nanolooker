import React from "react";

export interface UsePriceReturn {
  usd?: number;
  usd24hChange?: number;
  btc?: number;
  btc24hChange?: number;
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

const usePrice = (): UsePriceReturn => {
  const [price, setPrice] = React.useState<UsePriceReturn>({});

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
    } catch (e) {}
  };

  React.useEffect(() => {
    getPrice();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return price;
};

export default usePrice;
