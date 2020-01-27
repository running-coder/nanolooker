import React from "react";
import { rpc } from "api/rpc";

export interface ActiveDifficultyResponse {
  network_minimum: string;
  network_current: string;
  multiplier: string;
}

export interface UseActiveDifficultyReturn {
  activeDifficulty: ActiveDifficultyResponse;
  getActiveDifficulty(): any;
}

const useActiveDifficulty = (): UseActiveDifficultyReturn => {
  const [activeDifficulty, setActiveDifficulty] = React.useState(
    {} as ActiveDifficultyResponse
  );

  const getActiveDifficulty = async () => {
    const response = (await rpc("active_difficulty")) || {};

    setActiveDifficulty(response);
  };

  React.useEffect(() => {
    getActiveDifficulty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { activeDifficulty, getActiveDifficulty };
};

export default useActiveDifficulty;
