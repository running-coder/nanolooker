import * as React from "react";

let nextRequestTimeout: number | undefined;

interface ScoresResponse {
  current_map: string;
  games_played: string;
  player_count: string;
  top_score: any; // TBD
  total_frags: string;
}

interface Statistics {
  gamesPlayed: string;
  totalFrags: string;
}

const useNanoQuakeJS = () => {
  const [topScore, setTopScore] = React.useState({});
  const [currentMap, setCurrentMap] = React.useState("");
  const [playerCount, setPlayerCount] = React.useState<undefined | string>();
  const [statistics, setStatistics] = React.useState({} as Statistics);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);

  const getScores = async () => {
    clearTimeout(nextRequestTimeout);
    setIsLoading(true);
    setIsError(false);

    try {
      const res = await fetch("/api/nanoquakejs/scores", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const {
        player_count: playerCount,
        top_score: topScore,
        current_map: currentMap,
        games_played: gamesPlayed,
        total_frags: totalFrags,
      }: ScoresResponse = await res.json();

      setStatistics({ gamesPlayed, totalFrags });
      setCurrentMap(currentMap);
      setPlayerCount(playerCount);
      setTopScore(topScore);
    } catch (err) {
      setIsError(true);
    }

    nextRequestTimeout = window.setTimeout(() => {
      getScores();
    }, 10000);
  };

  React.useEffect(() => {
    function visibilityChange() {
      if (document.visibilityState === "visible") {
        getScores();
      } else {
        clearTimeout(nextRequestTimeout);
      }
    }
    getScores();
    window.addEventListener("visibilitychange", visibilityChange);

    return () => {
      clearTimeout(nextRequestTimeout);
      window.removeEventListener("visibilitychange", visibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { playerCount, currentMap, topScore, statistics, isLoading, isError };
};

export default useNanoQuakeJS;
