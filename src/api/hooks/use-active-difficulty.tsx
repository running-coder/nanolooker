import * as React from "react";

import { rpc } from "api/rpc";

export interface ActiveDifficultyResponse {
  network_minimum: string;
  network_current: string;
  multiplier: string;
}

export interface UseActiveDifficultyReturn {
  activeDifficulty: ActiveDifficultyResponse;
  getActiveDifficulty(): any;
  isError: boolean;
}

const useActiveDifficulty = (): UseActiveDifficultyReturn => {
  const [activeDifficulty, setActiveDifficulty] = React.useState({} as ActiveDifficultyResponse);
  const [isError, setIsError] = React.useState(false);

  const getActiveDifficulty = async () => {
    const json = await rpc("active_difficulty");

    !json || json.error ? setIsError(true) : setActiveDifficulty(json);
  };

  React.useEffect(() => {
    getActiveDifficulty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { activeDifficulty, getActiveDifficulty, isError };
};

export default useActiveDifficulty;
