import * as React from "react";

import orderBy from "lodash/orderBy";

export interface Player {
  player: number;
  nanoPotions: string;
  exp: number;
}

const useNanoBrowserQuestPlayers = () => {
  const [leaderboard, setLeaderboard] = React.useState<Player[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);

  const getLeaderboard = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const res = await fetch("/api/nanobrowserquest/leaderboard", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const json = (await res.json()) as Player[];

      const mappedLeaderboard = orderBy(json, ["exp", "gold"], ["desc", "desc"]).map(
        (player, index) => ({
          ...player,
          rank: index + 1,
        }),
      );

      setLeaderboard(mappedLeaderboard);
    } catch (err) {
      setIsError(true);
    }
    setIsLoading(false);
  };

  React.useEffect(() => {
    getLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { leaderboard, isLoading, isError };
};

export default useNanoBrowserQuestPlayers;
