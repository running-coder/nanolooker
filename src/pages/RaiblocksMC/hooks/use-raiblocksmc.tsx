import * as React from "react";

interface Statistics {
  // define your statistic keys
  onlinePlayers: number;
  statistic1: any;
  statistic2: any;
  statistic3: any;
  playerScore: PlayerScore[];
}

export interface PlayerScore {
  rank: number;
  player: string;
  kills: number;
}

const useNanoQuakeJS = () => {
  const [statistics, setStatistics] = React.useState({} as Statistics);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);

  const getScores = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const res = await fetch("/api/raiblocksmc", {
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
    getScores();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { statistics, isLoading, isError };
};

export default useNanoQuakeJS;
