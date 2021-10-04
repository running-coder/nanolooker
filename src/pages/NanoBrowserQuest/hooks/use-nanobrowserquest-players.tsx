import * as React from "react";

let nextRequestTimeout: number | undefined;

interface Response {
  playerCount: number;
}

const useNanoBrowserQuestPlayers = () => {
  const [playerCount, setPlayerCount] = React.useState<undefined | number>();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);

  const getPlayers = async () => {
    clearTimeout(nextRequestTimeout);
    setIsLoading(true);
    setIsError(false);

    try {
      const res = await fetch("/api/nanobrowserquest/players", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const json = await res.json();

      const { playerCount }: Response = json;

      setPlayerCount(playerCount);
    } catch (err) {
      setIsError(true);
    }

    setIsLoading(false);

    nextRequestTimeout = window.setTimeout(() => {
      getPlayers();
    }, 5000);
  };

  React.useEffect(() => {
    function visibilityChange() {
      if (document.visibilityState === "visible") {
        getPlayers();
      } else {
        clearTimeout(nextRequestTimeout);
      }
    }
    getPlayers();
    window.addEventListener("visibilitychange", visibilityChange);

    return () => {
      clearTimeout(nextRequestTimeout);
      window.removeEventListener("visibilitychange", visibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { playerCount, isLoading, isError };
};

export default useNanoBrowserQuestPlayers;
