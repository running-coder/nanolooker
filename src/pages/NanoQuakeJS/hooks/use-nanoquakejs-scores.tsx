import * as React from "react";

import orderBy from "lodash/orderBy";

let nextRequestTimeout: number | undefined;

interface ScoresResponse {
  current_map: string;
  games_played: string;
  player_count: string;
  top_score: { [key: string]: string };
  total_frags: string;
}

interface Statistics {
  gamesPlayed: string;
  totalFrags: string;
}

export interface PlayerScore {
  rank: number;
  player: string;
  frags: number;
}

const useNanoQuakeJS = () => {
  const [topScores, setTopScores] = React.useState([] as PlayerScore[]);
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
      const json = await res.json();

      const {
        player_count: playerCount,
        top_score: topScores,
        current_map: currentMap,
        games_played: gamesPlayed,
        total_frags: totalFrags,
      }: ScoresResponse = json;

      const mappedTopScores = orderBy(
        Object.entries(topScores).map(([player, frags]) => ({
          player,
          frags: parseInt(frags),
        })),
        ["frags"],
        ["desc"],
      ).map((topScore, index) => ({
        ...topScore,
        rank: index + 1,
      }));

      setStatistics({ gamesPlayed, totalFrags });
      setCurrentMap(currentMap);
      setPlayerCount(playerCount);
      setTopScores(mappedTopScores);
    } catch (err) {
      setIsError(true);
    }

    setIsLoading(false);

    nextRequestTimeout = window.setTimeout(() => {
      getScores();
    }, 5000);
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

  return { playerCount, currentMap, topScores, statistics, isLoading, isError };
};

export default useNanoQuakeJS;
