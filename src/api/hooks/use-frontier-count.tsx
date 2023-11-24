import * as React from "react";

import { rpc } from "api/rpc";

export interface FrontierCountResponse {
  count: string;
}

export interface UsefrontierCountReturn {
  frontierCount: FrontierCountResponse;
  getFrontierCount: Function;
  isLoading: boolean;
  isError: boolean;
}

const useFrontierCount = (): UsefrontierCountReturn => {
  const [frontierCount, setFrontierCount] = React.useState({} as FrontierCountResponse);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isError, setIsError] = React.useState<boolean>(false);

  const getFrontierCount = async () => {
    setIsError(false);
    setIsLoading(true);
    const json = await rpc("frontier_count");

    !json || json.error ? setIsError(true) : setFrontierCount(json);
    setIsLoading(false);
  };

  React.useEffect(() => {
    getFrontierCount();
  }, []);

  return { frontierCount, getFrontierCount, isLoading, isError };
};

export default useFrontierCount;
