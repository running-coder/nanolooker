import * as React from "react";

export interface Statistics {
  serverStatus: String, // Server
  onlinePlayers: String[];
  playersRegistered: number;
  numberOfTransactions: number;
  activePlayers7d: number;
  treasureHuntReward: number; // Treasure Hunt
  treasureHuntResetIn: String;
  treasureHuntDynmap: String;
  treasureHuntCoordinates: String;
  treasureHuntIncreaseRate: number;
  treasureHuntTotalPayout: number;
  playersInPvpWorld: String[]; // PvP
  pvpWorldPlayerBounty: String;
  pvpWorldPlayerBountyAmount: number;
  pvpWorldJoinBet: number;
  pvpWorldTotalPayout: number;
  playerReferralsCount: number; // Referral
  totalReferralsPayout: number;
  referralJoiningReward: number;
  numberOfShops: number; // Market
  numberOfItemsListed: number;
  numberOfItemsSold: number;
  totalShopRevenues: number;
}

const useRaiblocksMCInfo = () => {
  const [statistics, setStatistics] = React.useState({} as Statistics);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);

  const getInfos = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const res = await fetch("/api/raiblocksmc/info", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const json = await res.json();
      setStatistics(json);

    } catch (err) {
      setIsError(true);
    }

    setIsLoading(false);
  };

  React.useEffect(() => {
    getInfos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { statistics, isLoading, isError };
};

export default useRaiblocksMCInfo;
