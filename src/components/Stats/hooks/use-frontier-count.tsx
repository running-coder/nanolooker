import React from "react";
import { rpc } from "api/rpc";

export interface FrontierCountResponse {
  count: string;
}

export interface UsefrontierCountReturn {
  frontierCount: FrontierCountResponse;
}

const useFrontierCount = (): UsefrontierCountReturn => {
  const [frontierCount, setFrontierCount] = React.useState(
    {} as FrontierCountResponse
  );

  const getFrontierCount = async () => {
    const json = (await rpc("frontier_count")) || {};
    setFrontierCount(json);
  };

  React.useEffect(() => {
    getFrontierCount();
  }, []);

  return { frontierCount };
};

export default useFrontierCount;
