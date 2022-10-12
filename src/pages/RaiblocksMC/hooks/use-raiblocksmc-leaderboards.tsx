import * as React from "react";

export interface Leaderboards {
  treasureHunt: TreasureHunt[];
  pvp: Pvp[];
  shops: Market[];
  referral: Referral[];
}

export interface Referral {
  rank: number;
  player: String;
  playersReferred: number;
  totalNanoReceived: number;
}

export interface TreasureHunt {
  rank: number;
  player: string;
  numberOfTreasures: number;
  totalNanoReceived: number;
}

export interface Pvp {
  rank: number;
  player: string;
  numberOfKills: number;
  totalNanoReceived: number;
}

export interface Market {
  rank: number;
  shop: string;
  numberOfTransactions: number;
  shopOwner: string;
  totalNanoReceived: number;
}

const useRaiblocksMCLeaderboards = () => {
  const [leaderboards, setLeaderboards] = React.useState({} as Leaderboards);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);

  const getLeaderboards = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const res = await fetch("/api/raiblocksmc/leaderboards", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const json = await res.json();
      setLeaderboards(json);
    } catch (err) {
      setIsError(true);
    }

    setIsLoading(false);
  };

  React.useEffect(() => {
    getLeaderboards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { leaderboards, isLoading, isError };
};

export default useRaiblocksMCLeaderboards;
