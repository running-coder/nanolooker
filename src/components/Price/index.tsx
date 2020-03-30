import React from "react";
// import { Skeleton } from "antd";
import { MarketStatisticsContext } from "api/contexts/MarketStatistics";
import StatisticsChange from "components/StatisticsChange";

const Price = () => {
  const {
    marketStatistics: {
      usdCurrentPrice,
      usd24hChange = 0,
      usdBtcCurrentPrice,
      usdBtc24hChange = 0,
      usdEthCurrentPrice,
      usdEth24hChange = 0
    }
    // isInitialLoading
  } = React.useContext(MarketStatisticsContext);

  // const skeletonProps = {
  //   isActive: true,
  //   isLoading: true, // isInitialLoading,
  //   paragraph: false
  //   style: {
  //     width: "40px"
  //   }
  // };

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginRight: "6px",
          minWidth: "50px"
        }}
      >
        <img
          src="/nano.png"
          width="16px"
          alt="Nano crypto currency price change 24h"
          style={{ marginRight: "3px" }}
        />
        {/* <Skeleton {...skeletonProps}> */}
        <span style={{ marginRight: "6px" }}>
          ${usdCurrentPrice?.toFixed(2)}
        </span>
        <StatisticsChange value={usd24hChange} isPercent />
        {/* </Skeleton> */}
      </div>
      <div
        style={{ display: "flex", alignItems: "center", marginRight: "6px" }}
      >
        <img
          src="/bitcoin.png"
          width="16px"
          alt="Bitcoin crypto currency price change 24h"
          style={{ marginRight: "3px" }}
        />
        <span style={{ marginRight: "6px" }}>
          ${usdBtcCurrentPrice?.toFixed(2)}
        </span>
        <StatisticsChange value={usdBtc24hChange} isPercent />
      </div>
      <div
        style={{ display: "flex", alignItems: "center", marginRight: "6px" }}
      >
        <img
          src="/ethereum.png"
          width="16px"
          alt="Ethereum crypto currency price change 24h"
          style={{ marginRight: "3px" }}
        />
        <span style={{ marginRight: "6px" }}>
          ${usdEthCurrentPrice?.toFixed(2)}
        </span>
        <StatisticsChange value={usdEth24hChange} isPercent />
      </div>
    </>
  );
};

export default Price;
