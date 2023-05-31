import * as React from "react";

import { Skeleton } from "antd";
import BigNumber from "bignumber.js";

import { MarketStatisticsContext } from "api/contexts/MarketStatistics";
import { CurrencyDecimal, CurrencySymbol, PreferencesContext } from "api/contexts/Preferences";
import SupportedCryptocurrency from "components/Preferences/Cryptocurrency/supported-cryptocurrency.json";
import StatisticsChange from "components/StatisticsChange";

const Price = () => {
  const { cryptocurrency } = React.useContext(PreferencesContext);
  const { isInitialLoading } = React.useContext(MarketStatisticsContext);

  const skeletonProps = {
    active: true,
    paragraph: false,
    loading: isInitialLoading,
  };

  const defaultCryptocurrency = SupportedCryptocurrency.find(
    ({ symbol }) => symbol === "nano",
  ) as CryptocurrencyPriceProps;

  return (
    <>
      <Skeleton {...skeletonProps}>
        <CryptocurrencyPrice {...defaultCryptocurrency} />

        {cryptocurrency.map(symbol => {
          const crypto = SupportedCryptocurrency.find(
            ({ symbol: supportedSymbol }) => supportedSymbol === symbol,
          );

          return crypto ? <CryptocurrencyPrice {...crypto} key={symbol} /> : null;
        })}
      </Skeleton>
    </>
  );
};

interface CryptocurrencyPriceProps {
  id: string;
  symbol: string;
  name: string;
}

const CryptocurrencyPrice = ({ id, symbol, name }: CryptocurrencyPriceProps) => {
  const { fiat } = React.useContext(PreferencesContext);
  const {
    marketStatistics: { priceStats },
  } = React.useContext(MarketStatisticsContext);

  const fiatPrice = priceStats?.[id]?.[fiat];
  if (!fiatPrice) return null;

  const originalPrice = new BigNumber(priceStats?.[id]?.[fiat]).toNumber();
  const decimals: number = CurrencyDecimal?.[fiat];
  const flooredPrice = Math.floor(originalPrice * Math.pow(10, decimals)) / Math.pow(10, decimals);
  const zerosAfterInt = -Math.floor(Math.log(originalPrice) / Math.log(10) + 1);
  const [, decimalString = ""] = String(originalPrice).split(".");
  const trailingDecimals = zerosAfterInt ? decimalString.substr(2, zerosAfterInt) : null;
  const price24hChange = priceStats?.[id]?.[`${fiat}_24h_change`];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginRight: "12px",
      }}
      key={symbol}
    >
      <img
        src={`/cryptocurrencies/logo/${symbol}.png`}
        width="16px"
        title={name}
        alt={`${name} cryptocurrency price change 24h`}
        style={{ marginRight: "3px" }}
      />
      <span style={{ marginRight: "6px" }}>
        {CurrencySymbol?.[fiat]}
        {new BigNumber(flooredPrice).toFormat(CurrencyDecimal?.[fiat])}
        {trailingDecimals ? <span style={{ fontSize: "10px" }}>{trailingDecimals}</span> : null}
      </span>
      <StatisticsChange
        value={price24hChange}
        isPercent
        suffix={
          <>
            {(symbol === "nano" || symbol === "xno") && price24hChange >= 25 ? "🥦" : null}
            {symbol === "ban" && price24hChange >= 25 ? "🍌" : null}
          </>
        }
      />
    </div>
  );
};

export default Price;
