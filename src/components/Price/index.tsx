import React from "react";
import { Skeleton } from "antd";
import { PreferencesContext } from "api/contexts/Preferences";
import { MarketStatisticsContext } from "api/contexts/MarketStatistics";
import StatisticsChange from "components/StatisticsChange";
import SupportedCryptocurrency from "components/Preferences/Cryptocurrency/supported-cryptocurrency.json";

const Price = () => {
  const { cryptocurrency, fiat } = React.useContext(PreferencesContext);
  const {
    marketStatistics: { priceStats },
    isInitialLoading
  } = React.useContext(MarketStatisticsContext);

  const skeletonProps = {
    active: true,
    paragraph: false,
    loading: isInitialLoading
  };

  return (
    <>
      <Skeleton {...skeletonProps}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginRight: "12px"
            // minWidth: "50px"
          }}
        >
          <img
            src="/nano.png"
            width="16px"
            alt="Nano crypto currency price change 24h"
            style={{ marginRight: "3px" }}
          />

          <span style={{ marginRight: "6px" }}>
            ${priceStats?.nano?.[fiat]?.toFixed(2)}
          </span>
          <StatisticsChange
            value={priceStats?.nano?.[`${fiat}_24h_change`]}
            isPercent
          />
        </div>
        {cryptocurrency.map(symbol => {
          const crypto = SupportedCryptocurrency.find(
            ({ symbol: supportedSymbol }) => supportedSymbol === symbol
          );

          return crypto ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginRight: "12px"
              }}
              key={crypto.id}
            >
              <img
                src={`/cryptocurrencies/logo/${crypto.symbol}.png`}
                width="16px"
                alt={`${crypto.name} cryptocurrency price change 24h`}
                style={{ marginRight: "3px" }}
              />
              <span style={{ marginRight: "6px" }}>
                ${priceStats?.[crypto.id]?.[fiat]?.toFixed(2)}
              </span>
              <StatisticsChange
                value={priceStats?.[crypto.id]?.[`${fiat}_24h_change`]}
                isPercent
              />
            </div>
          ) : null;
        })}
      </Skeleton>
    </>
  );
};

export default Price;
