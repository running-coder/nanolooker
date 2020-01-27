import React from "react";
import { rpc } from "api/rpc";

export interface FrontierCountResponse {
  count: string;
}

export interface UsefrontierCountReturn {
  frontierCount: FrontierCountResponse;
  isError: boolean;
}

const useFrontierCount = (): UsefrontierCountReturn => {
  const [frontierCount, setFrontierCount] = React.useState(
    {} as FrontierCountResponse
  );
  const [isError, setIsError] = React.useState(false);

  const getFrontierCount = async () => {
    const json = await rpc("frontier_count");

    !json || json.error ? setIsError(true) : setFrontierCount(json);
  };

  React.useEffect(() => {
    getFrontierCount();
  }, []);

  return { frontierCount, isError };
};

export default useFrontierCount;
