import * as React from "react";

let nextRequestTimeout: number | undefined;

const useNanoQuakeJS = () => {
  const [topScore, setTopScore] = React.useState({});
  const [playerCount, setPlayerCount] = React.useState<undefined | string>();
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
      } = await res.json();

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

  return { playerCount, topScore, isLoading, isError };
};

export default useNanoQuakeJS;
